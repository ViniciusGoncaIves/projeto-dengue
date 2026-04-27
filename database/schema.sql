CREATE TABLE IF NOT EXISTS public.usuario
(
    idusuario integer NOT NULL DEFAULT nextval('usuario_idusuario_seq'::regclass),
    nome character varying(100) COLLATE pg_catalog."default" NOT NULL,
    email character varying(150) COLLATE pg_catalog."default" NOT NULL,
    senha character varying(255) COLLATE pg_catalog."default" NOT NULL,
    tipo tipo_usuario DEFAULT 'USER'::tipo_usuario,
    data_cadastro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT usuario_pkey PRIMARY KEY (idusuario)
);

CREATE TABLE IF NOT EXISTS public.denuncia
(
    iddenuncia integer NOT NULL DEFAULT nextval('denuncia_iddenuncia_seq'::regclass),
    usuario_id integer,
    descricao text COLLATE pg_catalog."default" NOT NULL,
    latitude numeric(9,6) NOT NULL,
    longitude numeric(9,6) NOT NULL,
    endereco text COLLATE pg_catalog."default",
    status status_denuncia DEFAULT 'PENDENTE'::status_denuncia,
    data_criacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    data_analise timestamp without time zone,
    motivo_rejeicao text COLLATE pg_catalog."default",
    CONSTRAINT denuncia_pkey PRIMARY KEY (iddenuncia),
    CONSTRAINT denuncia_usuario_id_fkey FOREIGN KEY (usuario_id)
        REFERENCES public.usuario (idusuario) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS public.imagem_denuncia
(
    idimagem_denuncia integer NOT NULL DEFAULT nextval('imagem_denuncia_idimagem_denuncia_seq'::regclass),
    denuncia_id integer,
    path_arquivo text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT imagem_denuncia_pkey PRIMARY KEY (idimagem_denuncia),
    CONSTRAINT imagem_denuncia_denuncia_id_fkey FOREIGN KEY (denuncia_id)
        REFERENCES public.denuncia (iddenuncia) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);
