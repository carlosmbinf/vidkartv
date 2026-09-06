export type Movie = {
  _id: string;
  actors?: string[] | string;
  clasificacion?: string[] | string;
  createdAt?: string | Date;
  descripcion?: string;
  extension?: string;
  mostrar?: boolean | string;
  nombrePeli?: string;
  subtitulo?: string;
  textSubtitle?: string;
  urlBackground?: string;
  urlBackgroundHTTPS?: string;
  urlPeli?: string;
  urlPeliHTTPS?: string;
  urlTrailer?: string;
  vistas?: number;
  year?: number | string;
};
