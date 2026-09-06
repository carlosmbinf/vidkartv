export type Series = {
  _id: string;
  actors?: string[] | string;
  anoLanzamiento?: number | string;
  clasificacion?: string[] | string;
  createdAt?: string | Date;
  descripcion?: string;
  idimdb?: string;
  mostrar?: boolean | string;
  nombre?: string;
  urlBackground?: string;
  urlBackgroundHTTPS?: string;
  urlTrailer?: string;
};

export type SeriesSeason = {
  _id: string;
  idSerie: string;
  numeroTemporada: number;
  url?: string;
};

export type SeriesChapter = {
  _id: string;
  nombre?: string;
  idTemporada: string;
  url?: string;
  urlHTTPS?: string;
  urlBackground?: string;
  urlBackgroundHTTPS?: string;
  descripcion?: string;
  mostrar?: boolean | string;
  createdAt?: string | Date;
  vistas?: number;
  capitulo?: number;
  numeroCapitulo?: number;
  extension?: string;
  subtitulo?: string;
  textSubtitle?: string;
};

export type SeriesPlayback = {
  chapter: SeriesChapter;
  season?: SeriesSeason | null;
  series?: Series | null;
  playbackToken: string;
  playbackTokenExpiresAt?: string;
};
