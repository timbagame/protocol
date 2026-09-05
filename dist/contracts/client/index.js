import * as v020 from "../v0.2.0/generated/index.js";
import * as v030 from "../v0.3.0/generated/index.js";
import { isContractVersion } from "../index.js";
const clients = { "0.2.0": v020, "0.3.0": v030 };
/** Use explicit version exports when only one deployment version is needed. */
export function getContractClient(version) {
    if (!isContractVersion(version))
        throw new Error(`Unsupported contract version: ${version}`);
    return clients[version];
}
export function decodeGame(version, data) {
    const client = getContractClient(version);
    if (client.identifyTimbaAccount(data) !== client.TimbaAccount.Game) {
        throw new Error("Account is not a Timba game");
    }
    const game = client.getGameDecoder().decode(data);
    if (game.participants.length !== game.ticketsCount) {
        throw new Error("Timba participant count does not match the game account");
    }
    return game;
}
/** Generated game enums have the same wire values in both supported versions. */
export function getGameTypeName(gameType) {
    switch (gameType) {
        case v020.GameType.Coinflip:
            return "coinflip";
        case v020.GameType.Giveaway:
            return "giveaway";
        default:
            throw new Error(`Unsupported game type: ${gameType}`);
    }
}
//# sourceMappingURL=index.js.map