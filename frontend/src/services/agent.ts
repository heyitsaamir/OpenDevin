import ActionType from "#/types/ActionType";
import { getSettings } from "./settings";
import Socket from "./socket";

/**
 * Initialize the agent with the current settings.
 * @param settings - The new settings.
 */
export const initializeAgent = async (userId?: string) => {
  await Socket.tryInitializeAwait(userId);
  if (!userId) {
    const settings = getSettings();
    const event = { action: ActionType.INIT, args: settings };
    const eventString = JSON.stringify(event);
    Socket.send(eventString);
  }
};
