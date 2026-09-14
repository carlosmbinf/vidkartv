export type Course = {
  _id: string;
  titulo?: string;
  descripcion?: string;
  categoria?: string;
  nivel?: string;
  profesorId?: string;
  profesorNombre?: string;
  profesorUsername?: string;
  precioMensual?: number;
  moneda?: string;
  portadaUrl?: string;
  bloqueadoPorNivel?: boolean;
  nivelRequerido?: number | string;
  nivelUsuario?: number | string | null;
  createdAt?: string | Date;
};

export type CourseSubscription = {
  _id?: string;
  cursoId: string;
  userId: string;
  estado?: string;
  fechaFin?: string | Date;
};

export type CourseLesson = {
  _id: string;
  cursoId?: string;
  orden?: number;
  titulo?: string;
  descripcion?: string;
  video?: {
    estado?: string;
    durationSeconds?: number;
  };
  publicado?: boolean;
};
