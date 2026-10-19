-- ============ CATÁLOGOS ============

CREATE TABLE tipos_establecimiento (
  id     TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(40)  NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE localidades (
  id     SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(40)  NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE productos_lacteos (
  id     TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(40)  NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- Único catálogo con "orden": define el orden de los segmentos y el color de serie en el gráfico.
CREATE TABLE destinos_lactosuero (
  id     TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(40)  NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  orden  TINYINT UNSIGNED NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- ============ DATOS DE LA ENCUESTA ============

CREATE TABLE relevamientos (
  id                    INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombre_establecimiento VARCHAR(150) NOT NULL,
  tipo_id               TINYINT UNSIGNED NOT NULL,
  localidad_id          SMALLINT UNSIGNED NULL,
  localidad_otro        VARCHAR(100) NULL,
  direccion             VARCHAR(255) NULL,
  latitud               DECIMAL(9,6) NULL,
  longitud              DECIMAL(9,6) NULL,
  litros_leche_dia      DECIMAL(10,2) NOT NULL CHECK (litros_leche_dia >= 0),
  dias_produccion       TINYINT UNSIGNED NOT NULL CHECK (dias_produccion BETWEEN 1 AND 7),
  genera_lactosuero     BOOLEAN NOT NULL,
  litros_suero_dia      DECIMAL(10,2) NULL CHECK (litros_suero_dia >= 0),
  productos_otro        VARCHAR(150) NULL,
  almacenamiento_frio   ENUM('si','no','nosabe') NULL,
  litros_frio           DECIMAL(10,2) NULL CHECK (litros_frio >= 0),
  interes_alternativas  ENUM('si','no','tal_vez') NULL,
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rel_tipo      FOREIGN KEY (tipo_id)      REFERENCES tipos_establecimiento(id),
  CONSTRAINT fk_rel_localidad FOREIGN KEY (localidad_id) REFERENCES localidades(id),
  CONSTRAINT chk_localidad CHECK (localidad_id IS NOT NULL OR localidad_otro IS NOT NULL)
) ENGINE=InnoDB;

CREATE TABLE relevamiento_productos (
  relevamiento_id INT UNSIGNED NOT NULL,
  producto_id     TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (relevamiento_id, producto_id),
  CONSTRAINT fk_rp_rel  FOREIGN KEY (relevamiento_id) REFERENCES relevamientos(id) ON DELETE CASCADE,
  CONSTRAINT fk_rp_prod FOREIGN KEY (producto_id)     REFERENCES productos_lacteos(id)
) ENGINE=InnoDB;

CREATE TABLE relevamiento_destinos (
  relevamiento_id INT UNSIGNED NOT NULL,
  destino_id      TINYINT UNSIGNED NOT NULL,
  porcentaje      DECIMAL(5,2) NOT NULL CHECK (porcentaje BETWEEN 0 AND 100),
  PRIMARY KEY (relevamiento_id, destino_id),
  CONSTRAINT fk_rd_rel  FOREIGN KEY (relevamiento_id) REFERENCES relevamientos(id) ON DELETE CASCADE,
  CONSTRAINT fk_rd_dest FOREIGN KEY (destino_id)      REFERENCES destinos_lactosuero(id)
) ENGINE=InnoDB;

CREATE TABLE relevamiento_estacionalidad (
  relevamiento_id INT UNSIGNED NOT NULL,
  mes             TINYINT UNSIGNED NOT NULL CHECK (mes BETWEEN 1 AND 12),
  nivel           ENUM('alta','media','baja','no_produce') NOT NULL,
  PRIMARY KEY (relevamiento_id, mes),
  CONSTRAINT fk_re_rel FOREIGN KEY (relevamiento_id) REFERENCES relevamientos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============ OPCIONES PRECARGADAS ============

INSERT INTO tipos_establecimiento (codigo, nombre) VALUES
  ('fabrica',     'Fábrica láctea / quesería'),
  ('tambo',       'Tambo con elaboración propia'),
  ('cooperativa', 'Cooperativa');

INSERT INTO localidades (codigo, nombre) VALUES
  ('san-vicente',    'San Vicente'),
  ('domselaar',      'Domselaar'),
  ('alejandro-korn', 'Alejandro Korn');

INSERT INTO productos_lacteos (codigo, nombre) VALUES
  ('mozzarella', 'Mozzarella'),
  ('blandos',    'Quesos blandos'),
  ('semiduros',  'Quesos semiduros'),
  ('duros',      'Quesos duros'),
  ('ricota',     'Ricota');

INSERT INTO destinos_lactosuero (codigo, nombre, orden) VALUES
  ('animal',   'Alimentación animal',          1),
  ('otro',     'Elaboración de otro producto', 2),
  ('venta',    'Entrega/venta a terceros',     3),
  ('efluente', 'Tratamiento como efluente',    4),
  ('descarte', 'Descarte sin aprovechamiento', 5);
