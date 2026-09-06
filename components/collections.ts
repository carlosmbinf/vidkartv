import { Mongo } from "../services/meteor/client";

export const PelisCollection = new Mongo.Collection("pelisRegister");
export const SeriesCollection = new Mongo.Collection("series");
export const TemporadasCollection = new Mongo.Collection("seriesTemporadas");
export const CapitulosCollection = new Mongo.Collection("seriesCapitulos");
