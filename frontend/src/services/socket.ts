// import { toast } from "sonner";
import toast from "#/utils/toast";
import { handleAssistantMessage } from "./actions";
import { getToken } from "./auth";
import { BACKEND_WSS_URL } from "./constants";

class Socket {
  private static _socket: WebSocket | null = null;

  // callbacks contain a list of callable functions
  // event: function, like:
  // open: [function1, function2]
  // message: [function1, function2]
  private static callbacks: {
    [K in keyof WebSocketEventMap]: ((data: WebSocketEventMap[K]) => void)[];
  } = {
    open: [],
    message: [],
    error: [],
    close: [],
  };

  private static initializing = false;

  public static tryInitialize(): void {
    Socket.tryInitializeAwait().catch(() => {
      const msg = `Connection failed. Retry...`;
      toast.stickyError("ws", msg);

      setTimeout(() => {
        this.tryInitialize();
      }, 1500);
    });
  }

  public static async tryInitializeAwait(userId?: string): Promise<void> {
    if (Socket.initializing) {
      toast.debugInfo("Socket is initializing");
      return;
    }
    Socket.initializing = true;
    const result = await getToken(userId);
    Socket._initialize(result, userId);
  }

  private static _initialize(token: string, userId?: string): void {
    if (Socket.isConnected()) return;

    const params = new URLSearchParams();
    params.append("token", token);
    if (userId) {
      params.append("uid", userId);
    }
    // Hardcode the url here to a wss because teams requires only secure connections from its iframs
    // const WS_URL = `ws://${window.location.host}/ws?token=${token}`;
    const WS_URL = `${BACKEND_WSS_URL}/ws?${params.toString()}`;
    Socket._socket = new WebSocket(WS_URL);

    Socket._socket.onopen = (e) => {
      toast.stickySuccess("ws", "Connected to server.");
      Socket.initializing = false;
      Socket.callbacks.open?.forEach((callback) => {
        callback(e);
      });
    };

    Socket._socket.onmessage = (e) => {
      handleAssistantMessage(e.data);
    };

    Socket._socket.onerror = () => {
      const msg = "Connection failed. Retry...";
      toast.stickyError("ws", msg);
    };

    Socket._socket.onclose = () => {
      // Reconnect after a delay
      setTimeout(() => {
        Socket.tryInitialize();
      }, 3000); // Reconnect after 3 seconds
    };
  }

  static isConnected(): boolean {
    return (
      Socket._socket !== null && Socket._socket.readyState === WebSocket.OPEN
    );
  }

  static send(message: string): void {
    if (!Socket.isConnected()) {
      Socket.tryInitialize();
    }
    if (Socket.initializing) {
      setTimeout(() => Socket.send(message), 1000);
      return;
    }

    if (Socket.isConnected()) {
      Socket._socket?.send(message);
    } else {
      const msg = "Connection failed. Retry...";
      toast.stickyError("ws", msg);
    }
  }

  static addEventListener(
    event: string,
    callback: (e: MessageEvent) => void,
  ): void {
    Socket._socket?.addEventListener(
      event as keyof WebSocketEventMap,
      callback as (
        this: WebSocket,
        ev: WebSocketEventMap[keyof WebSocketEventMap],
      ) => never,
    );
  }

  static removeEventListener(
    event: string,
    listener: (e: Event) => void,
  ): void {
    Socket._socket?.removeEventListener(event, listener);
  }

  static registerCallback<K extends keyof WebSocketEventMap>(
    event: K,
    callbacks: ((data: WebSocketEventMap[K]) => void)[],
  ): void {
    if (Socket.callbacks[event] === undefined) {
      return;
    }
    Socket.callbacks[event].push(...callbacks);
  }
}

export default Socket;
