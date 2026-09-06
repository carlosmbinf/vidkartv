import React from "react";
import TVPlayer, { type TVPlayerProps } from "./TVPlayer";

export default function MoviePlayer(props: TVPlayerProps) {
  return <TVPlayer {...props} type="movie" />;
}

