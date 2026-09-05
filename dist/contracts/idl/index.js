import { timbaIdlV020 } from "../v0.2.0/index.js";
import { timbaIdlV030 } from "../v0.3.0/index.js";
import { isContractVersion } from "../index.js";
const idls = { "0.2.0": timbaIdlV020, "0.3.0": timbaIdlV030 };
export function getContractIdl(version) {
    if (!isContractVersion(version))
        throw new Error(`Unsupported contract version: ${version}`);
    return idls[version];
}
//# sourceMappingURL=index.js.map