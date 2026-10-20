-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 01-10-2026 a las 04:54:25
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

CREATE DATABASE IF NOT EXISTS ciencia_datos;

USE ciencia_datos;

START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `ciencia_datos`
--

-- --------------------------------------------------------
CREATE TABLE `consultas` (
  `id_consulta` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `consulta` text NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_consulta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `usuarios_admin` (
  `id_admin` int(11) NOT NULL AUTO_INCREMENT,
  `usuario` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id_admin`),
  UNIQUE KEY `usuario` (`usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Estructura de tabla para la tabla `alumnos`
--

CREATE TABLE `alumnos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `iniciales` varchar(5) NOT NULL,
  `año` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `alumnos`
--

INSERT INTO `alumnos` (`id`, `nombre`, `iniciales`, `año`) VALUES
(1, 'Aberasturi, Tomás Francisco\r\n', 'AT', 2026),
(2, 'Almada Renard, María', 'AR', 2026),
(3, 'Armán, Agustín Matías', 'AM', 2026),
(4, 'Cabral, Anabela Magalí', 'CM', 2026),
(5, 'Espinola, Darío', 'ED', 2026),
(6, 'Espinoza Castro, Sergio', 'ES', 2026),
(7, 'Galeano, Liliana', 'GL', 2026),
(8, 'Gimenez Finocchio, Mora', 'GM', 2026),
(9, 'Ledesma, Lautaro', 'LL', 2026),
(10, 'Luna, Victoria Aymara', 'LV', 2026),
(11, 'Maglietta, Leandro', 'ML', 2026),
(12, 'Peirone, Emilce Grisel', 'PG', 2026),
(13, 'Pousa Morena', 'PM', 2026),
(14, 'Puente, Martín Nicolás', 'PM', 2026),
(15, 'Sivrigian, Romina', 'SR', 2026),
(16, 'Sotelo, Emmanuel', 'SE', 2026),
(17, 'Varela, Aylen Rocío', 'VR', 2026),
(18, 'Vicente, Tadeo', 'VT', 2026);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `alumnos`
--
ALTER TABLE `alumnos`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `alumnos`
--
ALTER TABLE `alumnos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- ----------------------------------------------------

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
