use base58check::ToBase58Check;
use concordium_std::*;
use std::ops::Deref;

#[derive(Serial, DeserialWithState)]
#[concordium(state_parameter = "S")]
struct State<S> {
    files: StateMap<String, StateSet<AccountAddress, S>, S>,
}

impl<S: HasStateApi> State<S> {
    fn new(state_builder: &mut StateBuilder<S>) -> Self {
        return State {
            files: state_builder.new_map(),
        };
    }

    fn find_file(&self, file_hash: &str) -> Option<StateRef<StateSet<AccountAddress, S>>> {
        return self.files.get(&file_hash.to_string());
    }

    fn get_witnesses(&self, file_hash: &str) -> Result<Vec<AccountAddress>, Reject> {
        let record = self.files.get(&file_hash.to_string());

        match record {
            Some(witnesses) => {
                // file exists
                return Result::Ok(witnesses.iter().map(|x| x.deref().clone()).collect());
            }
            None => {
                return Result::Err(Reject::new(2).unwrap());
            }
        }
    }

    fn add_witness(&mut self, file_hash: &str, witness: AccountAddress) {
        self.files
            .get_mut(&file_hash.to_string())
            .unwrap()
            .insert(witness);
    }

    fn add_file(&mut self, file_hash: &str, state_builder: &mut StateBuilder<S>) {
        self.files
            .insert(file_hash.to_string(), state_builder.new_set());
    }
}

#[derive(Debug, Serialize, SchemaType)]
enum Event {
    WitnessAddedEvent { file_hash: String, witness: String },
    FileAddedEvent { file_hash: String },
}


#[init(contract = "notary")]
fn contract_init<S: HasStateApi>(
    _ctx: &impl HasInitContext,
    state_builder: &mut StateBuilder<S>,
) -> InitResult<State<S>> {
    Ok(State::new(state_builder))
}

#[receive(
    contract = "notary",
    name = "registerfile",
    parameter = "String",
    mutable,
    enable_logger
)]
fn register_file<S: HasStateApi>(
    ctx: &impl HasReceiveContext,
    host: &mut impl HasHost<State<S>, StateApiType = S>,
    logger: &mut impl HasLogger,
) -> ReceiveResult<()> {
    let file_hash: String = ctx.parameter_cursor().get()?;
    let invoker = ctx.invoker();
    let witness_string = invoker.0.to_base58check(1);

    let (state, builder) = host.state_and_builder();
    let record = state.find_file(&file_hash);

    match record {
        Some(_w) => {
            // file exists
            state.add_witness(&file_hash, invoker);
            logger.log(&Event::WitnessAddedEvent {
                file_hash,
                witness: witness_string,
            })?;
        }
        None => {
            // file does not exist. Add file, Add Witness
            state.add_file(&file_hash, builder);
            logger.log(&Event::FileAddedEvent {
                file_hash: file_hash.clone(),
            })?;

            state.add_witness(&file_hash, invoker);
            logger.log(&Event::WitnessAddedEvent {
                file_hash,
                witness: witness_string,
            })?;
        }
    }

    return Result::Ok(());
}

#[receive(contract = "notary", name = "getfile", parameter = "String")]
fn get_file<S: HasStateApi>(
    ctx: &impl HasReceiveContext,
    host: &impl HasHost<State<S>, StateApiType = S>,
) -> ReceiveResult<Vec<AccountAddress>> {
    let file_hash: String = ctx.parameter_cursor().get()?;
    let state = host.state();
    let record = state.find_file(&file_hash);

    match record {
        Some(_w) => {
            // file exists
            return state.get_witnesses(&file_hash);
        }
        None => {
            return Result::Err(Reject::new(2).unwrap());
        }
    }
}

#[concordium_cfg_test]
mod tests {
    use crate::{contract_init, get_file, register_file, Event, State};
    use concordium_std::{
        claim, claim_eq, concordium_test,
        test_infrastructure::{
            TestHost, TestInitContext, TestLogger, TestReceiveContext, TestStateBuilder,
        },
        to_bytes, AccountAddress, ExpectReport, HasLogger,
    };
    use base58check::ToBase58Check;

    const ACCOUNT_0: AccountAddress = AccountAddress([1u8; 32]);
    const ACCOUNT_1: AccountAddress = AccountAddress([2u8; 32]);
    const FILE_HASH_0: &str = "14fe0aed941aa0a0be1118d7b7dd70bfca475310c531f1b5a179b336c075db65";

    #[concordium_test]
    fn test_init() {
        let result = 2 + 2;
        assert_eq!(result, 4);

        let ctx = TestInitContext::empty();
        let mut builder = TestStateBuilder::new();
        let init_result = contract_init(&ctx, &mut builder);

        let state = init_result.expect_report("Contract Initialization failed");
        claim_eq!(
            state.files.iter().count(),
            0,
            "No files present after initialization"
        );
    }

    #[concordium_test]
    fn test_register_file() {
        let mut ctx = TestReceiveContext::empty();
        ctx.set_invoker(ACCOUNT_0);

        let param_string = FILE_HASH_0.to_string();
        let param_bytes = to_bytes(&param_string);
        ctx.set_parameter(param_bytes.as_slice());

        let mut logger = TestLogger::init();
        let mut state_builder = TestStateBuilder::new();
        let state = State::new(&mut state_builder);
        let mut host = TestHost::new(state, state_builder);

        let result = register_file(&ctx, &mut host, &mut logger);
        claim!(result.is_ok(), "Results in rejection");
        claim_eq!(logger.logs.len(), 2, "Exactly 2 event should be logger");

        let file_added_event = Event::FileAddedEvent {
            file_hash: FILE_HASH_0.to_string(),
        };
        claim!(
            logger.logs.contains(&to_bytes(&file_added_event)),
            "Should contain file added event"
        );

        let witness_added_event = Event::WitnessAddedEvent {
            file_hash: FILE_HASH_0.to_string(),
            witness: ACCOUNT_0.0.to_base58check(1),
        };
        claim!(
            logger.logs.contains(&to_bytes(&witness_added_event)),
            "Should contain witness added event"
        );
    }

    #[concordium_test]
    fn test_register_file_twice() {
        let mut ctx = TestReceiveContext::empty();
        ctx.set_invoker(ACCOUNT_0);

        let param_string = FILE_HASH_0.to_string();
        let param_bytes = to_bytes(&param_string);
        ctx.set_parameter(param_bytes.as_slice());

        let mut logger = TestLogger::init();
        let mut state_builder = TestStateBuilder::new();
        let state = State::new(&mut state_builder);
        let mut host = TestHost::new(state, state_builder);

        let result = register_file(&ctx, &mut host, &mut logger);
        claim!(result.is_ok(), "Results in rejection");
        claim_eq!(logger.logs.len(), 2, "Exactly 2 event should be logger");

        let file_added_event = Event::FileAddedEvent {
            file_hash: FILE_HASH_0.to_string(),
        };
        claim!(
            logger.logs.contains(&to_bytes(&file_added_event)),
            "Should contain file added event"
        );

        let witness_added_event = Event::WitnessAddedEvent {
            file_hash: FILE_HASH_0.to_string(),
            witness: ACCOUNT_0.0.to_base58check(1),
        };
        claim!(
            logger.logs.contains(&to_bytes(&witness_added_event)),
            "Should contain witness added event"
        );

        // register second
        let mut ctx = TestReceiveContext::empty();
        ctx.set_invoker(ACCOUNT_1);

        let param_string = FILE_HASH_0.to_string();
        let param_bytes = to_bytes(&param_string);
        ctx.set_parameter(param_bytes.as_slice());

        let mut logger = TestLogger::init();

        let result = register_file(&ctx, &mut host, &mut logger);
        claim!(result.is_ok(), "Results in rejection");
        claim_eq!(logger.logs.len(), 1, "Exactly 1 event should be logger");

        let witness_added_event = Event::WitnessAddedEvent {
            file_hash: FILE_HASH_0.to_string(),
            witness: ACCOUNT_1.0.to_base58check(1),
        };
        claim!(
            logger.logs.contains(&to_bytes(&witness_added_event)),
            "Should contain witness added event"
        );
    }

    #[concordium_test]
    fn test_get_file() {
        let mut ctx = TestReceiveContext::empty();
        ctx.set_invoker(ACCOUNT_0);

        let param_string = FILE_HASH_0.to_string();
        let param_bytes = to_bytes(&param_string);
        ctx.set_parameter(param_bytes.as_slice());

        let mut logger = TestLogger::init();
        let mut state_builder = TestStateBuilder::new();
        let state = State::new(&mut state_builder);
        let mut host = TestHost::new(state, state_builder);

        let result = register_file(&ctx, &mut host, &mut logger);
        claim!(result.is_ok(), "file was not registered");

        let witnesses_result = get_file(&ctx, &host);
        claim!(witnesses_result.is_ok(), "could not get witnesses");

        let witnesses = witnesses_result.unwrap();
        claim_eq!(witnesses.len(), 1, "there should be 1 witness");
        claim_eq!(
            witnesses[0],
            ACCOUNT_0,
            "witness account address should match"
        );
    }
}
