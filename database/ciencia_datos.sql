-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 01-10-2026 a las 04:54:25
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
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
