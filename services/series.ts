import { Meteor } from "./meteor/client";
import type { Series, SeriesChapter, SeriesPlayback, SeriesSeason } from "../types/series";

const call = <T>(method: string, ...args: unknown[]) =>
  new Promise<T>((resolve, reject) => {
    Meteor.call(method, ...args, (error: any, result: T) => {
      if (error) reject(error);
      else resolve(result);
    });
  });

export const getSeries = (id: string) => call<Series | null>("getSerie", id);
export const getSeriesSeasons = (id: string) => call<SeriesSeason[]>("getTemporadasSerie", id);
export const getSeasonChapters = (id: string) => call<SeriesChapter[]>("getCapitulosTemporada", id);
export const getChapter = (id: string) => call<SeriesChapter | null>("getCapitulo", id);
export const prepareChapterPlayback = (id: string) => call<SeriesPlayback | null>("prepareCapituloPlayback", id);
export const addChapterView = (id: string) => call<boolean>("addVistasCapitulo", id);
export const getSeriesGenres = () => call<string[]>("getSeriesClasificacion");
