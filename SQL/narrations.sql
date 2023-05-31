--
-- PostgreSQL database dump
--

-- Dumped from database version 12.15 (Ubuntu 12.15-0ubuntu0.20.04.1)
-- Dumped by pg_dump version 12.15 (Ubuntu 12.15-0ubuntu0.20.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: narrations; Type: TABLE; Schema: public; Owner: POSTGRES
--

CREATE TABLE public.narrations (
    id_dbname text,
    id integer DEFAULT nextval('public.id_narration_seq'::regclass) NOT NULL,
    subject text,
    title text,
    "user" integer,
    id_row integer DEFAULT nextval('public.id_row_table_narrations'::regclass) NOT NULL,
    copied_from text
);


ALTER TABLE public.narrations OWNER TO POSTGRES;

--
-- Name: narrations narrations_pkey; Type: CONSTRAINT; Schema: public; Owner: POSTGRES
--

ALTER TABLE ONLY public.narrations
    ADD CONSTRAINT narrations_pkey PRIMARY KEY (id_row);


--
-- PostgreSQL database dump complete
--

