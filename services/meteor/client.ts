import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import Meteor from "@meteorrn/core";
import type React from "react";

const DEFAULT_METEOR_URL = "wss://www.vidkar.com/websocket";
const DEFAULT_HLS_SERVER_URL = "https://hls.vidkar.com";

const secureStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export type MeteorUser = {
  _id: string;
  id?: string;
  username?: string;
  emails?: Array<{ address?: string; verified?: boolean }>;
  subscipcionPelis?: boolean;
  [key: string]: unknown;
};

type TrackerHook = <T>(tracker: () => T, deps?: React.DependencyList) => T;

type MeteorApi = {
  connect: (endpoint: string, options?: { AsyncStorage: typeof secureStorage }) => void | Promise<void>;
  status: () => { connected: boolean; status?: string };
  user: () => MeteorUser | null | undefined;
  userId: () => string | null;
  loginWithPassword: (selector: string, password: string, callback: (error?: any) => void) => void;
  logout: (callback: (error?: any) => void) => void;
  subscribe: (...args: any[]) => { ready: () => boolean };
  call: (...args: any[]) => void;
  useTracker: TrackerHook;
  Mongo: { Collection: new (name: string) => any };
};

const meteorApi = Meteor as unknown as MeteorApi;

const normalize = (value: unknown) => {
  const normalized = typeof value === "string" ? value.trim() : "";
  return /^wss?:\/\//i.test(normalized) ? normalized : null;
};

const normalizeHttp = (value: unknown) => {
  const normalized = normalize(value)?.replace(/\/$/, "");
  return normalized && /^https?:\/\//i.test(normalized) ? normalized : null;
};

export const getMeteorUrl = () =>
  normalize(process.env.EXPO_PUBLIC_METEOR_URL) ||
  normalize(Constants.expoConfig?.extra?.meteorUrl) ||
  DEFAULT_METEOR_URL;

export const getHlsServerUrl = () =>
  normalizeHttp(process.env.EXPO_PUBLIC_HLS_SERVER_URL) ||
  normalizeHttp(Constants.expoConfig?.extra?.hlsServerUrl) ||
  DEFAULT_HLS_SERVER_URL;

export const ensureMeteorConnection = async () => {
  if (meteorApi.status?.()?.connected) {
    return true;
  }

  await meteorApi.connect(getMeteorUrl(), { AsyncStorage: secureStorage });
  return true;
};

export const Mongo = meteorApi.Mongo;
export { meteorApi as Meteor };
