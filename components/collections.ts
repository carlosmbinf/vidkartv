import { Mongo } from "../services/meteor/client";

export const PelisCollection = new Mongo.Collection("pelisRegister");
export const SeriesCollection = new Mongo.Collection("series");
export const TemporadasCollection = new Mongo.Collection("seriesTemporadas");
export const CapitulosCollection = new Mongo.Collection("seriesCapitulos");
export const CursosCollection = new Mongo.Collection("cursos");
export const LeccionesCursoCollection = new Mongo.Collection("cursos_lecciones");
export const SuscripcionesCursoCollection = new Mongo.Collection("cursos_suscripciones");
