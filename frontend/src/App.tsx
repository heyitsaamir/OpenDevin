import { useDisclosure } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import CogTooth from "#/assets/cog-tooth";
import ChatInterface from "#/components/chat/ChatInterface";
import Errors from "#/components/Errors";
import { Container, Orientation } from "#/components/Resizable";
import Workspace from "#/components/Workspace";
import LoadPreviousSessionModal from "#/components/modals/load-previous-session/LoadPreviousSessionModal";
import SettingsModal from "#/components/modals/settings/SettingsModal";
import { fetchMsgs } from "#/services/session";
import Socket from "#/services/socket";
import { ResFetchMsgTotal } from "#/types/ResponseType";
import "./App.css";
import AgentControlBar from "./components/AgentControlBar";
import AgentStatusBar from "./components/AgentStatusBar";
import Terminal from "./components/terminal/Terminal";
import { initializeAgent } from "./services/agent";
import { settingsAreUpToDate } from "./services/settings";
import { app } from "@microsoft/teams-js";
import store from "#/store";
import { appendError } from "./state/errorsSlice";
import { setTeamsContext } from "./state/teamsSlice";
import toast from "./utils/toast";
import { handleAssistantMessage } from "./services/actions";
import { addChatMessageFromEvent } from "./services/chatService";
import { getPlan } from "./services/planService";
import { setPlan } from "./state/planSlice";

interface Props {
  setSettingOpen: (isOpen: boolean) => void;
}

function Controls({ setSettingOpen }: Props): JSX.Element {
  return (
    <div className="flex w-full p-4 bg-neutral-900 items-center shrink-0 justify-between">
      <div className="flex items-center gap-4">
        <AgentControlBar />
      </div>
      <AgentStatusBar />
      <div
        className="cursor-pointer hover:opacity-80 transition-all"
        onClick={() => setSettingOpen(true)}
      >
        <CogTooth />
      </div>
    </div>
  );
}

// React.StrictMode will cause double rendering, use this to prevent it
let initOnce = false;

function App(): JSX.Element {
  const [isWarned, setIsWarned] = useState(false);

  const {
    isOpen: settingsModalIsOpen,
    onOpen: onSettingsModalOpen,
    onOpenChange: onSettingsModalOpenChange,
  } = useDisclosure();

  const {
    isOpen: loadPreviousSessionModalIsOpen,
    onOpen: onLoadPreviousSessionModalOpen,
    onOpenChange: onLoadPreviousSessionModalOpenChange,
  } = useDisclosure();

  const onResumeSession = async () => {
    try {
      const { messages } = await fetchMsgs();
      toast.debugInfo(`Fetched ${messages.length} messages from the session`);
      messages.forEach((message) => {
        if (message.role === "user") {
          addChatMessageFromEvent(message.payload);
        }

        if (message.role === "assistant") {
          handleAssistantMessage(message.payload);
        }
      });
      const fetchedPlan = await getPlan();
      store.dispatch(setPlan(fetchedPlan));
    } catch (error) {
      toast.stickyError("ws", "Error fetching the session");
    }
  };

  useEffect(() => {
    if (initOnce) return;
    initOnce = true;

    const initApp = (userId?: string) => {
      Socket.registerCallback("open", [onResumeSession]);
      initializeAgent(userId)
        .then(() => {
          toast.info("Agent initialized for user " + userId);
        })
        .catch((e) => {
          console.error(e);
          toast.stickyError("ws", "Connection failed. Retry...");
        });
    };

    // if (!settingsAreUpToDate()) {
    //   onSettingsModalOpen();
    // } else {
    app
      .initialize()
      .then(() => {
        // toast.debugInfo("Teams initialized");
        app
          .getContext()
          .then((context) => {
            // toast.debugInfo("Teams context fetched");
            store.dispatch(setTeamsContext(context));
            toast.stickySuccess(
              "Teams",
              `Teams context fetched for user ${context.user?.displayName}`,
            );
            initApp(context.user?.id);
          })
          .catch((e) => {
            toast.stickyError("err1", JSON.stringify(e));
            store.dispatch(
              appendError(e.message ?? "Eroror fetching teams context"),
            );
          });
      })
      .catch((e) => {
        toast.stickyError("err2", JSON.stringify(e));
        store.dispatch(
          appendError(e.message ?? "Eroror fetching teams context"),
        );
        initApp();
      });
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="flex grow bg-neutral-900 text-white min-h-0">
        <Container
          orientation={Orientation.VERTICAL}
          className="grow h-full min-h-0 min-w-0"
          initialSize={window.innerHeight - 300}
          firstChild={<Workspace />}
          firstClassName="min-h-72 rounded-xl border border-neutral-600 bg-neutral-800 flex flex-col overflow-hidden"
          secondChild={<Terminal />}
          secondClassName="min-h-72 rounded-xl border border-neutral-600 bg-neutral-800"
        />
      </div>
      <Controls setSettingOpen={onSettingsModalOpen} />
      <SettingsModal
        isOpen={settingsModalIsOpen}
        onOpenChange={onSettingsModalOpenChange}
      />
      <LoadPreviousSessionModal
        isOpen={loadPreviousSessionModalIsOpen}
        onOpenChange={onLoadPreviousSessionModalOpenChange}
      />
      <Errors />
      <Toaster />
    </div>
  );
}

export default App;
