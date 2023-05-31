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
-- Name: users; Type: TABLE; Schema: public; Owner: POSTGRES
--

CREATE TABLE public.users (
    id integer DEFAULT nextval('public.id_users_seq'::regclass) NOT NULL,
    username character(500) NOT NULL,
    password character(500),
    email character(500),
    vrelinks character(1500)
);


ALTER TABLE public.users OWNER TO POSTGRES;

--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: POSTGRES
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

