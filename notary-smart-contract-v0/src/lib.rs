use base58check::ToBase58Check;
use concordium_std::*;

#[derive(Serialize, PartialEq, Eq, Debug, SchemaType, Default)]
struct State {
    files: HashMap<String, HashSet<AccountAddress>>,
}

impl State {
    fn new() -> Self {
        return State {
            files: HashMap::default(),
        };
    }

    fn find_file(&self, file_hash: &str) -> Option<&HashSet<AccountAddress>> {
        return self.files.get(&file_hash.to_string());
    }

    fn add_witness(&mut self, file_hash: &str, witness: AccountAddress) {
        self.files
            .get_mut(&file_hash.to_string())
            .unwrap()
            .insert(witness);
    }

    fn add_file(&mut self, file_hash: &str) {
        self.files.insert(file_hash.to_string(), HashSet::default());
    }
}

#[derive(Debug, Serialize, SchemaType)]
enum Event {
    WitnessAddedEvent { file_hash: String, witness: String },
    FileAddedEvent { file_hash: String },
}

#[init(contract = "notary")]
fn contract_init(_ctx: &impl HasInitContext) -> InitResult<State> {
    Ok(State::new())
}

#[receive(
    contract = "notary",
    name = "registerfile",
    parameter = "String",
    enable_logger
)]
fn register_file<A: HasActions>(
    ctx: &impl HasReceiveContext,
    logger: &mut impl HasLogger,
    state: &mut State,
) -> ReceiveResult<A> {
    let file_hash: String = ctx.parameter_cursor().get()?;
    let invoker = ctx.invoker();
    let witness_string = invoker.0.to_base58check(1);

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
            state.add_file(&file_hash);
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

    return Result::Ok(A::accept());
}

#[concordium_cfg_test]
mod tests {
    use super::*;
    use test_infrastructure::*;

    const ACCOUNT_0: AccountAddress = AccountAddress([1u8; 32]);
    const FILE_HASH_0: &str = "14fe0aed941aa0a0be1118d7b7dd70bfca475310c531f1b5a179b336c075db65";

    #[concordium_test]
    fn test_init() {
        let result = 2 + 2;
        assert_eq!(result, 4);

        let ctx = InitContextTest::empty();
        let init_result = contract_init(&ctx);

        let state = init_result.expect_report("Contract Initialization failed");
        claim_eq!(
            state.files.iter().count(),
            0,
            "No files present after initialization"
        );
    }

    #[concordium_test]
    fn test_register_file() {
        let mut ctx = ReceiveContextTest::empty();
        ctx.set_invoker(ACCOUNT_0);

        let param_string = FILE_HASH_0.to_string();
        let param_bytes = to_bytes(&param_string);
        ctx.set_parameter(param_bytes.as_slice());

        let mut logger = LogRecorder::init();
        let mut state = State::new();

        let result: ReceiveResult<ActionsTree> = register_file(&ctx, &mut logger, &mut state);
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
}
