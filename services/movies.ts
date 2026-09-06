import { Meteor } from "./meteor/client";
import type { Movie } from "../types/movie";

export const MOVIE_FIELDS = {
  _id: 1,
  actors: 1,
  clasificacion: 1,
  createdAt: 1,
  descripcion: 1,
  extension: 1,
  mostrar: 1,
  nombrePeli: 1,
  subtitulo: 1,
  textSubtitle: 1,
  urlBackground: 1,
  urlBackgroundHTTPS: 1,
  urlPeli: 1,
  urlPeliHTTPS: 1,
  urlTrailer: 1,
  vistas: 1,
  year: 1,
};

export const getMovie = (id: string) =>
  new Promise<Movie | null>((resolve, reject) => {
    Meteor.call("getPelicula", id, (error: any, result: Movie | null) => {
      if (error) reject(error);
      else resolve(result || null);
    });
  });

export const addMovieView = (id: string) => {
  Meteor.call("addVistas", id);
};
