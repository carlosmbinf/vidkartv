import { Meteor, type MeteorUser } from "./client";

const CURRENT_USER_FIELDS = {
  _id: 1,
  username: 1,
  emails: 1,
  profile: 1,
  subscipcionPelis: 1,
};

export const hasMovieSubscription = (user: MeteorUser | null | undefined) =>
  user?.subscipcionPelis === true;

export const destinationForUser = (user: MeteorUser | null | undefined) =>
  hasMovieSubscription(user) ? "/(app)/home" : "/(app)/subscription";

export const useCurrentSession = () =>
  Meteor.useTracker(() => {
    const connected = Boolean(Meteor.status().connected);
    const userId = Meteor.userId?.() || null;
    const user = userId ? Meteor.user?.() || null : null;
    const subscription = connected && userId
      ? Meteor.subscribe("user", { _id: userId }, { fields: CURRENT_USER_FIELDS })
      : null;

    return {
      userId,
      user,
      userReady: Boolean(connected && userId && user && subscription?.ready()),
    };
  });