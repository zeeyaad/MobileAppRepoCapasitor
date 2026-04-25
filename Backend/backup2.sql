--
-- PostgreSQL database dump
--

\restrict lnp3tVxrAAaMcsAYdoBVrBxqLAxv4TGQKhsleuOWzPkNxgtYPBXSU6zYUb5aYRc

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


ALTER TYPE auth.oauth_authorization_status OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


ALTER TYPE auth.oauth_client_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


ALTER TYPE auth.oauth_registration_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


ALTER TYPE auth.oauth_response_type OWNER TO supabase_auth_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- Name: tasks_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tasks_status_enum AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public.tasks_status_enum OWNER TO postgres;

--
-- Name: tasks_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tasks_type_enum AS ENUM (
    'SPORT_CREATION',
    'FINANCE',
    'MEMBERSHIP_UPDATE',
    'GENERAL'
);


ALTER TYPE public.tasks_type_enum OWNER TO postgres;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_admin;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_admin;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_admin;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_admin;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_admin;

--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


ALTER TYPE storage.buckettype OWNER TO supabase_storage_admin;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- Name: trigger_set_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_set_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.trigger_set_timestamp() OWNER TO postgres;

--
-- Name: update_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_timestamp() OWNER TO postgres;

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_
        -- Filter by action early - only get subscriptions interested in this action
        -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
        and (subs.action_filter = '*' or subs.action_filter = action::text);

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_admin;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_admin;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
  res jsonb;
begin
  if type_::text = 'bytea' then
    return to_jsonb(val);
  end if;
  execute format('select to_jsonb(%L::'|| type_::text || ')', val) into res;
  return res;
end
$$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_admin;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_admin;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_admin;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    -- Generate a new UUID for the id
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_admin;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- Name: delete_leaf_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_rows_deleted integer;
BEGIN
    LOOP
        WITH candidates AS (
            SELECT DISTINCT
                t.bucket_id,
                unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        ),
        uniq AS (
             SELECT
                 bucket_id,
                 name,
                 storage.get_level(name) AS level
             FROM candidates
             WHERE name <> ''
             GROUP BY bucket_id, name
        ),
        leaf AS (
             SELECT
                 p.bucket_id,
                 p.name,
                 p.level
             FROM storage.prefixes AS p
                  JOIN uniq AS u
                       ON u.bucket_id = p.bucket_id
                           AND u.name = p.name
                           AND u.level = p.level
             WHERE NOT EXISTS (
                 SELECT 1
                 FROM storage.objects AS o
                 WHERE o.bucket_id = p.bucket_id
                   AND o.level = p.level + 1
                   AND o.name COLLATE "C" LIKE p.name || '/%'
             )
             AND NOT EXISTS (
                 SELECT 1
                 FROM storage.prefixes AS c
                 WHERE c.bucket_id = p.bucket_id
                   AND c.level = p.level + 1
                   AND c.name COLLATE "C" LIKE p.name || '/%'
             )
        )
        DELETE
        FROM storage.prefixes AS p
            USING leaf AS l
        WHERE p.bucket_id = l.bucket_id
          AND p.name = l.name
          AND p.level = l.level;

        GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;
        EXIT WHEN v_rows_deleted = 0;
    END LOOP;
END;
$$;


ALTER FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) OWNER TO supabase_storage_admin;

--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO supabase_storage_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_common_prefix(text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT CASE
    WHEN position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(p_key, length(p_prefix) + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)))
    ELSE NULL
END;
$$;


ALTER FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) OWNER TO supabase_storage_admin;

--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


ALTER FUNCTION storage.get_level(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


ALTER FUNCTION storage.get_prefix(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


ALTER FUNCTION storage.get_prefixes(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix, 1) = delimiter_param THEN
        v_upper_bound := left(v_prefix, -1) || chr(ascii(delimiter_param) + 1);
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'AND o.name COLLATE "C" < $3 ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'AND o.name COLLATE "C" >= $3 ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor: find the last item in range
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Cursor provided: determine if it refers to a folder or leaf
        IF EXISTS (
            SELECT 1 FROM storage.objects o
            WHERE o.bucket_id = _bucket_id
              AND o.name COLLATE "C" LIKE v_start || delimiter_param || '%'
            LIMIT 1
        ) THEN
            -- Cursor refers to a folder
            IF v_is_asc THEN
                v_next_seek := v_start || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_start || delimiter_param;
            END IF;
        ELSE
            -- Cursor refers to a leaf object
            IF v_is_asc THEN
                v_next_seek := v_start || delimiter_param;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := rtrim(v_common_prefix, delimiter_param);
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1) || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := v_current.name;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                RETURN NEXT;
                v_count := v_count + 1;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := v_current.name || delimiter_param;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text, sort_order text) OWNER TO supabase_storage_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.protect_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.protect_delete() OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;
    v_skipped INT := 0;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach (unchanged)
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT path_tokens[$1] AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $2 || '%%'
                  AND bucket_id = $3
                  AND array_length(objects.path_tokens, 1) <> $1
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata FROM folders)
            UNION ALL
            (SELECT path_tokens[$1] AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata
             FROM storage.objects
             WHERE objects.name ILIKE $2 || '%%'
               AND bucket_id = $3
               AND array_length(objects.path_tokens, 1) = $1
             ORDER BY %I %s)
            LIMIT $4 OFFSET $5
            $sql$, v_sort_order, v_order_by, v_sort_order
        ) USING levels, v_prefix, bucketname, v_limit, offsets;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'AND lower(o.name) COLLATE "C" < $3 ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'AND lower(o.name) COLLATE "C" >= $3 ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC: find the last item in range first (static SQL)
        IF v_upper_bound IS NOT NULL THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower AND lower(o.name) COLLATE "C" < v_upper_bound
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSIF v_prefix_lower <> '' THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSE
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        END IF;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix_lower <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := split_part(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter), v_delimiter, levels);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := lower(v_current.name);
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := split_part(v_current.name, v_delimiter, levels);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := lower(v_current.name) || v_delimiter;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_by_timestamp(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
BEGIN
    v_prefix := coalesce(p_prefix, '');

    IF p_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $1 || '%%'
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                rtrim(common_prefix, '/') AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    date_trunc('milliseconds', %I),
                    name COLLATE "C"
                ) %s ROW(
                    COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz),
                    $5
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s
        LIMIT $4
    $sql$,
        p_sort_column,
        v_cursor_op,
        p_sort_column,
        p_sort_order,
        p_sort_order
    );

    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after;
END;
$_$;


ALTER FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) OWNER TO supabase_storage_admin;

--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            start_after,
            '',
            v_sort_ord
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after
        );
    END IF;
END;
$$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text, sort_order text, sort_column text, sort_column_after text) OWNER TO supabase_storage_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: custom_oauth_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.custom_oauth_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_type text NOT NULL,
    identifier text NOT NULL,
    name text NOT NULL,
    client_id text NOT NULL,
    client_secret text NOT NULL,
    acceptable_client_ids text[] DEFAULT '{}'::text[] NOT NULL,
    scopes text[] DEFAULT '{}'::text[] NOT NULL,
    pkce_enabled boolean DEFAULT true NOT NULL,
    attribute_mapping jsonb DEFAULT '{}'::jsonb NOT NULL,
    authorization_params jsonb DEFAULT '{}'::jsonb NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    email_optional boolean DEFAULT false NOT NULL,
    issuer text,
    discovery_url text,
    skip_nonce_check boolean DEFAULT false NOT NULL,
    cached_discovery jsonb,
    discovery_cached_at timestamp with time zone,
    authorization_url text,
    token_url text,
    userinfo_url text,
    jwks_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT custom_oauth_providers_authorization_url_https CHECK (((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_authorization_url_length CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_client_id_length CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512))),
    CONSTRAINT custom_oauth_providers_discovery_url_length CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_identifier_format CHECK ((identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)),
    CONSTRAINT custom_oauth_providers_issuer_length CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048)))),
    CONSTRAINT custom_oauth_providers_jwks_uri_https CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_jwks_uri_length CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048))),
    CONSTRAINT custom_oauth_providers_name_length CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100))),
    CONSTRAINT custom_oauth_providers_oauth2_requires_endpoints CHECK (((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))),
    CONSTRAINT custom_oauth_providers_oidc_discovery_url_https CHECK (((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_issuer_https CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_requires_issuer CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL))),
    CONSTRAINT custom_oauth_providers_provider_type_check CHECK ((provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))),
    CONSTRAINT custom_oauth_providers_token_url_https CHECK (((token_url IS NULL) OR (token_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_token_url_length CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_userinfo_url_https CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_userinfo_url_length CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)))
);


ALTER TABLE auth.custom_oauth_providers OWNER TO supabase_auth_admin;

--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


ALTER TABLE auth.oauth_authorizations OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE auth.oauth_client_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


ALTER TABLE auth.oauth_clients OWNER TO supabase_auth_admin;

--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


ALTER TABLE auth.oauth_consents OWNER TO supabase_auth_admin;

--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accounts (
    id integer NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'member'::character varying NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    last_login timestamp without time zone,
    password_changed_at timestamp without time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.accounts OWNER TO postgres;

--
-- Name: accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.accounts_id_seq OWNER TO postgres;

--
-- Name: accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.accounts_id_seq OWNED BY public.accounts.id;


--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_logs (
    id integer NOT NULL,
    member_id integer,
    action character varying(100) NOT NULL,
    description character varying(255),
    action_date timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.activity_logs OWNER TO postgres;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activity_logs_id_seq OWNER TO postgres;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- Name: advertisement_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.advertisement_categories (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    name_en character varying(100) NOT NULL,
    name_ar character varying(100) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    color_code character varying(50),
    description_en character varying(500),
    description_ar character varying(500)
);


ALTER TABLE public.advertisement_categories OWNER TO postgres;

--
-- Name: advertisement_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.advertisement_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.advertisement_categories_id_seq OWNER TO postgres;

--
-- Name: advertisement_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.advertisement_categories_id_seq OWNED BY public.advertisement_categories.id;


--
-- Name: advertisement_photos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.advertisement_photos (
    id integer NOT NULL,
    advertisement_id integer NOT NULL,
    photo_url character varying(500) NOT NULL,
    display_order integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    original_filename character varying(100) NOT NULL,
    alt_text_en character varying(100),
    alt_text_ar character varying(100)
);


ALTER TABLE public.advertisement_photos OWNER TO postgres;

--
-- Name: advertisement_photos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.advertisement_photos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.advertisement_photos_id_seq OWNER TO postgres;

--
-- Name: advertisement_photos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.advertisement_photos_id_seq OWNED BY public.advertisement_photos.id;


--
-- Name: advertisements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.advertisements (
    id integer NOT NULL,
    description_en text NOT NULL,
    description_ar text NOT NULL,
    category_id integer NOT NULL,
    created_by integer NOT NULL,
    approved_by integer,
    approved_at timestamp without time zone,
    is_featured boolean DEFAULT false NOT NULL,
    start_date date,
    end_date date,
    view_count integer DEFAULT 0 NOT NULL,
    click_count integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    title_en character varying(200) NOT NULL,
    title_ar character varying(200) NOT NULL,
    status character varying(50) NOT NULL,
    approval_status character varying(50),
    approval_notes character varying(500)
);


ALTER TABLE public.advertisements OWNER TO postgres;

--
-- Name: advertisements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.advertisements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.advertisements_id_seq OWNER TO postgres;

--
-- Name: advertisements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.advertisements_id_seq OWNED BY public.advertisements.id;


--
-- Name: announcements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.announcements (
    id integer NOT NULL,
    sport_id integer NOT NULL,
    branch_id integer,
    created_by_staff_id integer NOT NULL,
    title_en character varying(200) NOT NULL,
    title_ar character varying(200) NOT NULL,
    description_en text,
    description_ar text,
    banner_image text,
    thumbnail_image text,
    external_link text,
    status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    is_visible boolean DEFAULT true NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    published_at timestamp without time zone,
    expires_at timestamp without time zone,
    view_count integer DEFAULT 0 NOT NULL,
    click_count integer DEFAULT 0 NOT NULL,
    subscription_count integer DEFAULT 0 NOT NULL,
    target_role character varying(20),
    min_age integer DEFAULT 0 NOT NULL,
    max_age integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.announcements OWNER TO postgres;

--
-- Name: announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.announcements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.announcements_id_seq OWNER TO postgres;

--
-- Name: announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.announcements_id_seq OWNED BY public.announcements.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    "userName" character varying(100) NOT NULL,
    role character varying(50) NOT NULL,
    action character varying(50) NOT NULL,
    module character varying(50) NOT NULL,
    description text,
    status character varying(20) NOT NULL,
    "ipAddress" character varying(45),
    "oldValue" jsonb,
    "newValue" jsonb,
    "dateTime" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: booking_participants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.booking_participants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid NOT NULL,
    full_name character varying(255) NOT NULL,
    phone_number character varying(20),
    national_id character varying(20),
    email character varying(255),
    is_creator boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT booking_participants_check CHECK (((phone_number IS NOT NULL) OR (national_id IS NOT NULL) OR (email IS NOT NULL)))
);


ALTER TABLE public.booking_participants OWNER TO postgres;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    member_id integer,
    team_member_id integer,
    field_id uuid NOT NULL,
    sport_id integer NOT NULL,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    duration_minutes integer GENERATED ALWAYS AS ((EXTRACT(epoch FROM (end_time - start_time)) / (60)::numeric)) STORED,
    price numeric(10,2) NOT NULL,
    status character varying(20) DEFAULT 'pending_payment'::character varying NOT NULL,
    payment_reference character varying(100),
    payment_completed_at timestamp without time zone,
    share_token character varying(64) NOT NULL,
    expected_participants integer DEFAULT 1 NOT NULL,
    notes text,
    language character varying(10) DEFAULT 'ar'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at timestamp without time zone,
    cancelled_at timestamp without time zone,
    CONSTRAINT bookings_check CHECK ((((member_id IS NOT NULL) AND (team_member_id IS NULL)) OR ((member_id IS NULL) AND (team_member_id IS NOT NULL)))),
    CONSTRAINT bookings_check1 CHECK ((end_time > start_time)),
    CONSTRAINT bookings_expected_participants_check CHECK ((expected_participants > 0)),
    CONSTRAINT bookings_language_check CHECK (((language)::text = ANY ((ARRAY['ar'::character varying, 'en'::character varying])::text[]))),
    CONSTRAINT bookings_price_check CHECK ((price >= (0)::numeric)),
    CONSTRAINT bookings_status_check CHECK (((status)::text = ANY ((ARRAY['pending_payment'::character varying, 'confirmed'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.bookings OWNER TO postgres;

--
-- Name: branch_sport_teams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.branch_sport_teams (
    id integer NOT NULL,
    branch_id integer NOT NULL,
    sport_id integer NOT NULL,
    created_by_staff_id integer NOT NULL,
    name_en character varying(100) NOT NULL,
    name_ar character varying(100) NOT NULL,
    description_en character varying(500),
    description_ar character varying(500),
    training_days character varying(100) NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    monthly_fee numeric(10,2) NOT NULL,
    registration_fee numeric(10,2),
    max_participants integer DEFAULT 0 NOT NULL,
    current_participants integer DEFAULT 0 NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    status_reason character varying(500),
    approved_by_staff_id integer,
    approved_at timestamp without time zone,
    approval_comments text,
    team_image text,
    min_age integer DEFAULT 0 NOT NULL,
    max_age integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.branch_sport_teams OWNER TO postgres;

--
-- Name: branch_sport_teams_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.branch_sport_teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.branch_sport_teams_id_seq OWNER TO postgres;

--
-- Name: branch_sport_teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.branch_sport_teams_id_seq OWNED BY public.branch_sport_teams.id;


--
-- Name: branches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.branches (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    name_en character varying(100) NOT NULL,
    name_ar character varying(100) NOT NULL,
    location_en character varying(100),
    location_ar character varying(100),
    phone character varying(20),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.branches OWNER TO postgres;

--
-- Name: branches_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.branches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.branches_id_seq OWNER TO postgres;

--
-- Name: branches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.branches_id_seq OWNED BY public.branches.id;


--
-- Name: employee_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_details (
    id integer NOT NULL,
    member_id integer NOT NULL,
    profession_id integer NOT NULL,
    department_en character varying(100),
    department_ar character varying(100),
    salary numeric(12,2),
    salary_slip character varying(255),
    employment_start_date date,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.employee_details OWNER TO postgres;

--
-- Name: employee_details_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employee_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_details_id_seq OWNER TO postgres;

--
-- Name: employee_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employee_details_id_seq OWNED BY public.employee_details.id;


--
-- Name: faculties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.faculties (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    name_en character varying(100) NOT NULL,
    name_ar character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.faculties OWNER TO postgres;

--
-- Name: faculties_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.faculties_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.faculties_id_seq OWNER TO postgres;

--
-- Name: faculties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.faculties_id_seq OWNED BY public.faculties.id;


--
-- Name: field_operating_hours; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.field_operating_hours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    field_id uuid NOT NULL,
    day_of_week integer NOT NULL,
    opening_time time without time zone NOT NULL,
    closing_time time without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT field_operating_hours_check CHECK ((closing_time > opening_time)),
    CONSTRAINT field_operating_hours_day_of_week_check CHECK (((day_of_week >= 0) AND (day_of_week <= 6)))
);


ALTER TABLE public.field_operating_hours OWNER TO postgres;

--
-- Name: fields; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fields (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name_en character varying(255) NOT NULL,
    name_ar character varying(255) NOT NULL,
    description_en text,
    description_ar text,
    sport_id integer NOT NULL,
    capacity integer,
    branch_id integer,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    hourly_rate numeric(10,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fields_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'maintenance'::character varying])::text[])))
);


ALTER TABLE public.fields OWNER TO postgres;

--
-- Name: media_posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media_posts (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    category character varying(50) NOT NULL,
    images text,
    "videoUrl" character varying(500),
    "videoDuration" character varying(20),
    date timestamp without time zone DEFAULT now() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.media_posts OWNER TO postgres;

--
-- Name: media_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.media_posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.media_posts_id_seq OWNER TO postgres;

--
-- Name: media_posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.media_posts_id_seq OWNED BY public.media_posts.id;


--
-- Name: member_memberships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.member_memberships (
    id integer NOT NULL,
    member_id integer NOT NULL,
    membership_plan_id integer NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status character varying(50) DEFAULT 'active'::character varying NOT NULL,
    payment_status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.member_memberships OWNER TO postgres;

--
-- Name: member_memberships_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.member_memberships_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.member_memberships_id_seq OWNER TO postgres;

--
-- Name: member_memberships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.member_memberships_id_seq OWNED BY public.member_memberships.id;


--
-- Name: member_relationships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.member_relationships (
    id integer NOT NULL,
    member_id integer NOT NULL,
    related_member_id integer NOT NULL,
    relationship_type character varying(50) NOT NULL,
    is_dependent boolean DEFAULT false NOT NULL,
    age_group character varying(50),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    relationship_name_ar character varying(100)
);


ALTER TABLE public.member_relationships OWNER TO postgres;

--
-- Name: member_relationships_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.member_relationships_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.member_relationships_id_seq OWNER TO postgres;

--
-- Name: member_relationships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.member_relationships_id_seq OWNED BY public.member_relationships.id;


--
-- Name: member_team_subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.member_team_subscriptions (
    id integer NOT NULL,
    member_id integer NOT NULL,
    team_id integer NOT NULL,
    created_by_staff_id integer,
    approved_by_staff_id integer,
    announcement_id integer,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    decline_reason text,
    cancellation_reason text,
    start_date date,
    end_date date,
    approved_at timestamp without time zone,
    declined_at timestamp without time zone,
    cancelled_at timestamp without time zone,
    monthly_fee numeric(10,2) NOT NULL,
    registration_fee numeric(10,2),
    discount_amount numeric(10,2) DEFAULT 0 NOT NULL,
    custom_price numeric(10,2),
    payment_status character varying(20) DEFAULT 'unpaid'::character varying NOT NULL,
    approval_notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.member_team_subscriptions OWNER TO postgres;

--
-- Name: member_team_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.member_team_subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.member_team_subscriptions_id_seq OWNER TO postgres;

--
-- Name: member_team_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.member_team_subscriptions_id_seq OWNED BY public.member_team_subscriptions.id;


--
-- Name: member_teams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.member_teams (
    id integer NOT NULL,
    team_id integer NOT NULL,
    member_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    start_date date,
    end_date date,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    price numeric(10,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.member_teams OWNER TO postgres;

--
-- Name: COLUMN member_teams.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.member_teams.status IS 'pending, approved, declined, cancelled, active, inactive';


--
-- Name: member_teams_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.member_teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.member_teams_id_seq OWNER TO postgres;

--
-- Name: member_teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.member_teams_id_seq OWNED BY public.member_teams.id;


--
-- Name: member_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.member_types (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    name_en character varying(100) NOT NULL,
    name_ar character varying(100) NOT NULL,
    description_en text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    description_ar character varying(4000)
);


ALTER TABLE public.member_types OWNER TO postgres;

--
-- Name: member_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.member_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.member_types_id_seq OWNER TO postgres;

--
-- Name: member_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.member_types_id_seq OWNED BY public.member_types.id;


--
-- Name: members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.members (
    id integer NOT NULL,
    account_id integer NOT NULL,
    first_name_en character varying(50) NOT NULL,
    first_name_ar character varying(50) NOT NULL,
    last_name_en character varying(50) NOT NULL,
    last_name_ar character varying(50) NOT NULL,
    national_id character varying(50) NOT NULL,
    gender character varying(20),
    phone character varying(20),
    nationality character varying(50),
    birthdate date,
    health_status character varying(100),
    is_foreign boolean DEFAULT false NOT NULL,
    medical_report character varying(255),
    member_type_id integer NOT NULL,
    points_balance integer DEFAULT 0 NOT NULL,
    status character varying(50) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    national_id_front text,
    national_id_back text,
    address text,
    photo character varying(255)
);


ALTER TABLE public.members OWNER TO postgres;

--
-- Name: members_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.members_id_seq OWNER TO postgres;

--
-- Name: members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.members_id_seq OWNED BY public.members.id;


--
-- Name: membership_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.membership_plans (
    id integer NOT NULL,
    member_type_id integer NOT NULL,
    plan_code character varying(50) NOT NULL,
    name_en character varying(100) NOT NULL,
    name_ar character varying(100) NOT NULL,
    description_en text,
    price numeric(12,2) NOT NULL,
    currency character varying(10) DEFAULT 'EGP'::character varying NOT NULL,
    duration_months integer NOT NULL,
    renewal_price numeric(12,2),
    is_installable boolean DEFAULT false NOT NULL,
    max_installments integer,
    is_active boolean DEFAULT true NOT NULL,
    is_for_foreigner boolean DEFAULT false NOT NULL,
    min_age integer,
    max_age integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    description_ar character varying(4000)
);


ALTER TABLE public.membership_plans OWNER TO postgres;

--
-- Name: membership_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.membership_plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.membership_plans_id_seq OWNER TO postgres;

--
-- Name: membership_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.membership_plans_id_seq OWNED BY public.membership_plans.id;


--
-- Name: outsider_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.outsider_details (
    id integer NOT NULL,
    member_id integer NOT NULL,
    job_title_en character varying(100),
    job_title_ar character varying(100),
    employment_status character varying(50) DEFAULT 'employed'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    branch_id integer,
    visitor_type character varying(50),
    passport_number character varying(50),
    passport_photo character varying(255),
    country character varying(100),
    visa_status character varying(50),
    duration_months integer,
    is_installable boolean DEFAULT false NOT NULL
);


ALTER TABLE public.outsider_details OWNER TO postgres;

--
-- Name: outsider_details_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.outsider_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.outsider_details_id_seq OWNER TO postgres;

--
-- Name: outsider_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.outsider_details_id_seq OWNED BY public.outsider_details.id;


--
-- Name: packages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.packages (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    name_en character varying(150) NOT NULL,
    name_ar character varying(150) NOT NULL,
    description_en character varying(500),
    description_ar character varying(500),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.packages OWNER TO postgres;

--
-- Name: packages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.packages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.packages_id_seq OWNER TO postgres;

--
-- Name: packages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.packages_id_seq OWNED BY public.packages.id;


--
-- Name: privilege_packages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.privilege_packages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.privilege_packages_id_seq OWNER TO postgres;

--
-- Name: privilege_packages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.privilege_packages_id_seq OWNED BY public.packages.id;


--
-- Name: privileges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.privileges (
    id integer NOT NULL,
    code character varying(100) NOT NULL,
    name_en character varying(150) NOT NULL,
    name_ar character varying(150) NOT NULL,
    description_en character varying(500),
    description_ar character varying(500),
    module character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.privileges OWNER TO postgres;

--
-- Name: privileges_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.privileges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.privileges_id_seq OWNER TO postgres;

--
-- Name: privileges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.privileges_id_seq OWNED BY public.privileges.id;


--
-- Name: privileges_packages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.privileges_packages (
    privilege_id integer NOT NULL,
    package_id integer NOT NULL
);


ALTER TABLE public.privileges_packages OWNER TO postgres;

--
-- Name: professions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.professions (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    name_en character varying(100) NOT NULL,
    name_ar character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.professions OWNER TO postgres;

--
-- Name: professions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.professions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.professions_id_seq OWNER TO postgres;

--
-- Name: professions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.professions_id_seq OWNED BY public.professions.id;


--
-- Name: retired_employee_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.retired_employee_details (
    id integer NOT NULL,
    member_id integer NOT NULL,
    former_department_en character varying(100),
    former_department_ar character varying(100),
    retirement_date date NOT NULL,
    salary_slip character varying(255),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    profession_code character varying(50),
    last_salary numeric(12,2)
);


ALTER TABLE public.retired_employee_details OWNER TO postgres;

--
-- Name: retired_employee_details_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.retired_employee_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.retired_employee_details_id_seq OWNER TO postgres;

--
-- Name: retired_employee_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.retired_employee_details_id_seq OWNED BY public.retired_employee_details.id;


--
-- Name: sport_branches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sport_branches (
    id integer NOT NULL,
    sport_id integer NOT NULL,
    branch_id integer NOT NULL,
    created_by_staff_id integer NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    status_reason character varying(500),
    is_enrollment_open boolean DEFAULT true NOT NULL,
    enrollment_start_date timestamp without time zone,
    enrollment_end_date timestamp without time zone,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sport_branches OWNER TO postgres;

--
-- Name: sport_branches_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sport_branches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sport_branches_id_seq OWNER TO postgres;

--
-- Name: sport_branches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sport_branches_id_seq OWNED BY public.sport_branches.id;


--
-- Name: sports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sports (
    id integer NOT NULL,
    name_en character varying(100) NOT NULL,
    name_ar character varying(100) NOT NULL,
    description_en character varying(500),
    description_ar character varying(500),
    price numeric(10,2),
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    created_by_staff_id integer NOT NULL,
    approved_by_staff_id integer,
    approved_at timestamp without time zone,
    approval_comments text,
    max_participants integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    sport_image text
);


ALTER TABLE public.sports OWNER TO postgres;

--
-- Name: sports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sports_id_seq OWNER TO postgres;

--
-- Name: sports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sports_id_seq OWNED BY public.sports.id;


--
-- Name: staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff (
    id integer NOT NULL,
    account_id integer NOT NULL,
    staff_type_id integer NOT NULL,
    first_name_en character varying(100) NOT NULL,
    first_name_ar character varying(100) NOT NULL,
    last_name_en character varying(100) NOT NULL,
    last_name_ar character varying(100) NOT NULL,
    national_id character varying(20) NOT NULL,
    phone character varying(20),
    address character varying(255),
    employment_start_date date NOT NULL,
    employment_end_date date,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.staff OWNER TO postgres;

--
-- Name: staff_action_approvals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_action_approvals (
    id integer NOT NULL,
    staff_id integer NOT NULL,
    action_type character varying(50) NOT NULL,
    action_data jsonb NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    submitted_by integer NOT NULL,
    approved_by integer,
    approval_comments text,
    submitted_at timestamp without time zone,
    approved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.staff_action_approvals OWNER TO postgres;

--
-- Name: staff_action_approvals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.staff_action_approvals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.staff_action_approvals_id_seq OWNER TO postgres;

--
-- Name: staff_action_approvals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.staff_action_approvals_id_seq OWNED BY public.staff_action_approvals.id;


--
-- Name: staff_activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_activity_logs (
    id integer NOT NULL,
    staff_id integer NOT NULL,
    action_type character varying(50) NOT NULL,
    description character varying(500),
    performed_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.staff_activity_logs OWNER TO postgres;

--
-- Name: staff_activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.staff_activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.staff_activity_logs_id_seq OWNER TO postgres;

--
-- Name: staff_activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.staff_activity_logs_id_seq OWNED BY public.staff_activity_logs.id;


--
-- Name: staff_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.staff_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.staff_id_seq OWNER TO postgres;

--
-- Name: staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.staff_id_seq OWNED BY public.staff.id;


--
-- Name: staff_package_privileges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_package_privileges (
    package_id integer NOT NULL,
    privilege_id integer NOT NULL,
    added_at timestamp without time zone DEFAULT now() NOT NULL,
    added_by integer
);


ALTER TABLE public.staff_package_privileges OWNER TO postgres;

--
-- Name: staff_packages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_packages (
    staff_id integer NOT NULL,
    package_id integer NOT NULL,
    assigned_at timestamp without time zone DEFAULT now() NOT NULL,
    assigned_by integer
);


ALTER TABLE public.staff_packages OWNER TO postgres;

--
-- Name: staff_privileges_override; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_privileges_override (
    staff_id integer NOT NULL,
    privilege_id integer NOT NULL,
    is_granted boolean DEFAULT true NOT NULL,
    assigned_at timestamp without time zone DEFAULT now() NOT NULL,
    assigned_by integer
);


ALTER TABLE public.staff_privileges_override OWNER TO postgres;

--
-- Name: staff_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_types (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    name_en character varying(100) NOT NULL,
    name_ar character varying(100) NOT NULL,
    description_en character varying(500),
    description_ar character varying(500),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.staff_types OWNER TO postgres;

--
-- Name: staff_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.staff_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.staff_types_id_seq OWNER TO postgres;

--
-- Name: staff_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.staff_types_id_seq OWNED BY public.staff_types.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    status public.tasks_status_enum DEFAULT 'pending'::public.tasks_status_enum NOT NULL,
    data jsonb,
    created_by character varying(100),
    assigned_to character varying(100),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    type public.tasks_type_enum DEFAULT 'GENERAL'::public.tasks_type_enum NOT NULL
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tasks_id_seq OWNER TO postgres;

--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: team_member_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.team_member_details (
    id integer NOT NULL,
    status character varying(50) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    "position" character varying(50) DEFAULT 'player'::character varying NOT NULL,
    team_member_id integer
);


ALTER TABLE public.team_member_details OWNER TO postgres;

--
-- Name: team_member_details_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.team_member_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.team_member_details_id_seq OWNER TO postgres;

--
-- Name: team_member_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.team_member_details_id_seq OWNED BY public.team_member_details.id;


--
-- Name: team_member_team_subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.team_member_team_subscriptions (
    id integer NOT NULL,
    team_member_id integer NOT NULL,
    team_id integer NOT NULL,
    created_by_staff_id integer,
    approved_by_staff_id integer,
    announcement_id integer,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    decline_reason text,
    cancellation_reason text,
    start_date date,
    end_date date,
    approved_at timestamp without time zone,
    declined_at timestamp without time zone,
    cancelled_at timestamp without time zone,
    monthly_fee numeric(10,2) NOT NULL,
    registration_fee numeric(10,2),
    discount_amount numeric(10,2) DEFAULT 0 NOT NULL,
    custom_price numeric(10,2),
    payment_status character varying(20) DEFAULT 'unpaid'::character varying NOT NULL,
    approval_notes text,
    special_notes text,
    is_captain boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.team_member_team_subscriptions OWNER TO postgres;

--
-- Name: team_member_team_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.team_member_team_subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.team_member_team_subscriptions_id_seq OWNER TO postgres;

--
-- Name: team_member_team_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.team_member_team_subscriptions_id_seq OWNED BY public.team_member_team_subscriptions.id;


--
-- Name: team_member_teams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.team_member_teams (
    id integer NOT NULL,
    team_name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    start_date date,
    end_date date,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    price numeric(10,2) DEFAULT 0 NOT NULL,
    team_member_id integer NOT NULL
);


ALTER TABLE public.team_member_teams OWNER TO postgres;

--
-- Name: COLUMN team_member_teams.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.team_member_teams.status IS 'pending, approved, declined, cancelled, active, inactive';


--
-- Name: team_member_teams_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.team_member_teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.team_member_teams_id_seq OWNER TO postgres;

--
-- Name: team_member_teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.team_member_teams_id_seq OWNED BY public.team_member_teams.id;


--
-- Name: team_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.team_members (
    id integer NOT NULL,
    account_id integer NOT NULL,
    first_name_en character varying(50) NOT NULL,
    first_name_ar character varying(50) NOT NULL,
    last_name_en character varying(50) NOT NULL,
    last_name_ar character varying(50) NOT NULL,
    gender character varying(20),
    phone character varying(20),
    nationality character varying(50),
    birthdate date,
    national_id character varying(50) NOT NULL,
    address text,
    photo character varying(255),
    medical_report character varying(255),
    is_foreign boolean DEFAULT false NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    national_id_front character varying(255),
    national_id_back character varying(255),
    proof character varying(255)
);


ALTER TABLE public.team_members OWNER TO postgres;

--
-- Name: team_members_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.team_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.team_members_id_seq OWNER TO postgres;

--
-- Name: team_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.team_members_id_seq OWNED BY public.team_members.id;


--
-- Name: university_student_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.university_student_details (
    id integer NOT NULL,
    member_id integer NOT NULL,
    faculty_id integer,
    graduation_year integer,
    enrollment_date date,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    student_proof character varying(255)
);


ALTER TABLE public.university_student_details OWNER TO postgres;

--
-- Name: university_student_details_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.university_student_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.university_student_details_id_seq OWNER TO postgres;

--
-- Name: university_student_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.university_student_details_id_seq OWNED BY public.university_student_details.id;


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_filter text DEFAULT '*'::text,
    CONSTRAINT subscription_action_filter_check CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


ALTER TABLE realtime.subscription OWNER TO supabase_admin;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE storage.buckets_analytics OWNER TO supabase_storage_admin;

--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.buckets_vectors OWNER TO supabase_storage_admin;

--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.vector_indexes OWNER TO supabase_storage_admin;

--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: accounts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts ALTER COLUMN id SET DEFAULT nextval('public.accounts_id_seq'::regclass);


--
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- Name: advertisement_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advertisement_categories ALTER COLUMN id SET DEFAULT nextval('public.advertisement_categories_id_seq'::regclass);


--
-- Name: advertisement_photos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advertisement_photos ALTER COLUMN id SET DEFAULT nextval('public.advertisement_photos_id_seq'::regclass);


--
-- Name: advertisements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advertisements ALTER COLUMN id SET DEFAULT nextval('public.advertisements_id_seq'::regclass);


--
-- Name: announcements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements ALTER COLUMN id SET DEFAULT nextval('public.announcements_id_seq'::regclass);


--
-- Name: branch_sport_teams id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branch_sport_teams ALTER COLUMN id SET DEFAULT nextval('public.branch_sport_teams_id_seq'::regclass);


--
-- Name: branches id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches ALTER COLUMN id SET DEFAULT nextval('public.branches_id_seq'::regclass);


--
-- Name: employee_details id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_details ALTER COLUMN id SET DEFAULT nextval('public.employee_details_id_seq'::regclass);


--
-- Name: faculties id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculties ALTER COLUMN id SET DEFAULT nextval('public.faculties_id_seq'::regclass);


--
-- Name: media_posts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_posts ALTER COLUMN id SET DEFAULT nextval('public.media_posts_id_seq'::regclass);


--
-- Name: member_memberships id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_memberships ALTER COLUMN id SET DEFAULT nextval('public.member_memberships_id_seq'::regclass);


--
-- Name: member_relationships id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_relationships ALTER COLUMN id SET DEFAULT nextval('public.member_relationships_id_seq'::regclass);


--
-- Name: member_team_subscriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_team_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.member_team_subscriptions_id_seq'::regclass);


--
-- Name: member_teams id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_teams ALTER COLUMN id SET DEFAULT nextval('public.member_teams_id_seq'::regclass);


--
-- Name: member_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_types ALTER COLUMN id SET DEFAULT nextval('public.member_types_id_seq'::regclass);


--
-- Name: members id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members ALTER COLUMN id SET DEFAULT nextval('public.members_id_seq'::regclass);


--
-- Name: membership_plans id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membership_plans ALTER COLUMN id SET DEFAULT nextval('public.membership_plans_id_seq'::regclass);


--
-- Name: outsider_details id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.outsider_details ALTER COLUMN id SET DEFAULT nextval('public.outsider_details_id_seq'::regclass);


--
-- Name: packages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.packages ALTER COLUMN id SET DEFAULT nextval('public.packages_id_seq'::regclass);


--
-- Name: privileges id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.privileges ALTER COLUMN id SET DEFAULT nextval('public.privileges_id_seq'::regclass);


--
-- Name: professions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professions ALTER COLUMN id SET DEFAULT nextval('public.professions_id_seq'::regclass);


--
-- Name: retired_employee_details id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.retired_employee_details ALTER COLUMN id SET DEFAULT nextval('public.retired_employee_details_id_seq'::regclass);


--
-- Name: sport_branches id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sport_branches ALTER COLUMN id SET DEFAULT nextval('public.sport_branches_id_seq'::regclass);


--
-- Name: sports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sports ALTER COLUMN id SET DEFAULT nextval('public.sports_id_seq'::regclass);


--
-- Name: staff id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff ALTER COLUMN id SET DEFAULT nextval('public.staff_id_seq'::regclass);


--
-- Name: staff_action_approvals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_action_approvals ALTER COLUMN id SET DEFAULT nextval('public.staff_action_approvals_id_seq'::regclass);


--
-- Name: staff_activity_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_activity_logs ALTER COLUMN id SET DEFAULT nextval('public.staff_activity_logs_id_seq'::regclass);


--
-- Name: staff_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_types ALTER COLUMN id SET DEFAULT nextval('public.staff_types_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: team_member_details id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_member_details ALTER COLUMN id SET DEFAULT nextval('public.team_member_details_id_seq'::regclass);


--
-- Name: team_member_team_subscriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_member_team_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.team_member_team_subscriptions_id_seq'::regclass);


--
-- Name: team_member_teams id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_member_teams ALTER COLUMN id SET DEFAULT nextval('public.team_member_teams_id_seq'::regclass);


--
-- Name: team_members id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members ALTER COLUMN id SET DEFAULT nextval('public.team_members_id_seq'::regclass);


--
-- Name: university_student_details id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.university_student_details ALTER COLUMN id SET DEFAULT nextval('public.university_student_details_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.custom_oauth_providers (id, provider_type, identifier, name, client_id, client_secret, acceptable_client_ids, scopes, pkce_enabled, attribute_mapping, authorization_params, enabled, email_optional, issuer, discovery_url, skip_nonce_check, cached_discovery, discovery_cached_at, authorization_url, token_url, userinfo_url, jwks_uri, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at, invite_token, referrer, oauth_client_state_id, linking_target_id, email_optional) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type, token_endpoint_auth_method) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
20260219120000
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
\.


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accounts (id, email, password, role, status, last_login, password_changed_at, is_active, created_at, updated_at) FROM stdin;
8	NiggeeRXONIGGER@gmail.com	$2b$10$iLOdqiIaIam2mArbs1jJP.u7mZJAE4M6zlbuzK5idtWlYnwmB3EUG	member	pending	\N	\N	t	2026-01-26 23:37:27.826727	2026-01-26 23:37:27.826727
9	Mohammeeeeeeddaowoidd@gmail.com	$2b$10$tIef2L30dA7cGBP5Ynk8xuL/5j/JUPdi.VR8rfjEPsLotIg9XIorG	member	pending	\N	\N	t	2026-01-26 23:58:40.045431	2026-01-26 23:58:40.045431
10	Momomo@gmail.com	$2b$10$hz1pwk2vYXs3icc8XFa5IutyHlNkZtoYrZG2n55VyyOag2I1oIv8O	member	pending	\N	\N	t	2026-01-27 00:16:39.312098	2026-01-27 00:16:39.312098
11	Momdomo@gmail.com	$2b$10$ku8zjOXTLw0yGht8FU5bx.xymMnIONkN75RBe0rDdI60ZlpZvzKTG	member	pending	\N	\N	t	2026-01-27 00:26:11.160167	2026-01-27 00:26:11.160167
12	mopdampdw@gmail.com	$2b$10$yFkdCeap1fDmZxNpRe268OSJ/q8lLIIC0epQM0yxABuyH.YbrS0xm	member	pending	\N	\N	t	2026-01-27 00:34:15.855043	2026-01-27 00:34:15.855043
13	ywa@gmail.com	$2b$10$zX0X0C4P0nCdPhP//uO.1.YhD03hUEK.pf.4Y.lc4dkCUkqNjzHSu	member	pending	\N	\N	t	2026-01-27 00:37:20.210906	2026-01-27 00:37:20.210906
14	MOOOOOOOOOOO@gmail.com	$2b$10$AlOU616Rw9/GDTLxCO74autK5D/taW2unl.VEmiPTCmCHEQ52jePe	member	pending	\N	\N	t	2026-01-27 01:23:55.87173	2026-01-27 01:23:55.87173
18	zeeyad@example.com	$2b$10$8H2WtCKVNTVc/d6lBqOnB.x34MnEdbEZvap.lxC1DVYlhEpBHDVBa	member	pending	\N	\N	t	2026-01-27 15:59:06.957428	2026-01-27 15:59:06.957428
19	zeeyad11@example.com	$2b$10$h2y8ph1Yv9vv59BM47r29.BONHK.1zcCUyDR9EKVkoURznRhlzs2q	member	pending	\N	\N	t	2026-01-28 15:40:23.910932	2026-01-28 15:40:23.910932
20	zeeyad191@example.com	$2b$10$0jA2gplIDb4.4xz9w9SO/uux8PCATcHUlqkU6w4sTx5bi5MyQguqG	member	pending	\N	\N	t	2026-01-28 17:18:13.993448	2026-01-28 17:18:13.993448
21	Mohammed@gmadllald.com	$2b$10$4e6MAytCWI2n7GrdYXaLIOezhKwB1Rb.w62RNWYEnTqM8SCeQ71Vy	member	pending	\N	\N	t	2026-01-30 16:38:15.093471	2026-01-30 16:38:15.093471
22	Mohaiawdoiawhd@gmail.comm	$2b$10$ZuC0D6GZDCokKU2u7plqseNW9WUUZJ7rER969O1mWbC55yPREE1nq	member	pending	\N	\N	t	2026-01-30 17:09:37.524576	2026-01-30 17:09:37.524576
23	Yaraaaa@gmail.com	$2b$10$xen/0UnpQZTfBtQcuidDR.Vy0PVg0ur4oD71ZMhfyKbQxEz4IYwNW	member	pending	\N	\N	t	2026-01-30 18:21:03.235669	2026-01-30 18:21:03.235669
24	MOMOM@gmail.com	$2b$10$ZJmmFtIFbKebP055lkhA7eOkku5G9yNXTpsFTPRKdk.ctx/kjaKOC	member	pending	\N	\N	t	2026-01-30 18:37:02.208279	2026-01-30 18:37:02.208279
25	Mo@gmail.commm	$2b$10$bwBqXMymfwSEuSGDRa3MeOOYRriHoYGyagGhntFtyixf4Obj80OFy	member	pending	\N	\N	t	2026-01-30 18:45:06.270544	2026-01-30 18:45:06.270544
26	Sosososososo@gmail.com	$2b$10$jL6YZ94U5BggD.mf8l0lgOEp9ahyamo.t1T431IyJdAm6rgZ3qh2C	member	pending	\N	\N	t	2026-01-30 21:35:38.972313	2026-01-30 21:35:38.972313
27	Mohamemmed@gmail.com	$2b$10$Bga3U8zjm.2gGeGnBPjRZewvkXe3Kj4sWfQzA.wuZl05gZ7O0xILK	member	pending	\N	\N	t	2026-01-31 20:42:01.83092	2026-01-31 20:42:01.83092
28	momomommyayayay@gmail.com	$2b$10$YDcXT7htmoXrRnASnEyi0O67F13lzUI8Mp80Lm70ArpIGLn7Evix6	member	pending	\N	\N	t	2026-02-01 02:09:55.459328	2026-02-01 02:09:55.459328
32	exec@club.com	$2b$10$HpG.0kLoJKZg0xoUIfg.JezQzQZRemco4JwEP1y44j9e1TgYuVP/C	staff	pending	\N	\N	t	2026-02-03 22:54:30.261784	2026-02-03 22:54:30.261784
33	depexec@club.com	$2b$10$mBDJ2EbV2mqLg0FFJDF5r.LQPAbdc6P.8bjIbPerTyV2x/zHPlzYq	staff	pending	\N	\N	t	2026-02-03 23:55:21.293481	2026-02-03 23:55:21.293481
34	exec2@club.com	$2b$10$nTWx9hP.6k2BTCLilOOYU.gMvM5LD2lUFGgv6PjhZLS3uVmfQXThi	staff	pending	\N	\N	t	2026-02-04 02:19:57.329261	2026-02-04 02:19:57.329261
35	depexec2@club.com	$2b$10$h9l2twper0hlidqAtPVbd.4I155GB44aE2o.J0BQBGEByD57N1sjm	staff	pending	\N	\N	t	2026-02-04 02:24:01.127318	2026-02-04 02:24:01.127318
36	finance@club.com	$2b$10$8TGUxOqMm4RP36CvPQYgVewj4YtRVepSdOQLw0TbS4UAKCakyOZcm	staff	active	\N	2026-02-04 05:41:36.869	t	2026-02-04 02:33:08.360031	2026-02-04 03:41:37.915391
37	ahmed@club.com	$2b$10$MaySiJ8o4IsHt5AuScKVtezEIteGOPo27gMmsDRAQZs62qNGJxmYS	staff	active	\N	2026-02-05 01:52:50.914	t	2026-02-04 15:03:01.239141	2026-02-04 23:52:51.542664
41	Moooo@gmaildaad.com	$2b$10$QgdBvRR9nC2zA3.Zl6liJOzmJiuNNsPH6397nJUOhc/Floc4hAHY.	member	pending	\N	\N	t	2026-02-06 16:28:09.120687	2026-02-06 16:28:09.120687
38	yara@club.com	$2b$10$TOiU5NH3YMCwiB25/ggw2.WEVoTGPaINfSHQ5yAVoenB2fCQOUjA2	staff	active	\N	2026-02-05 06:31:43.417	t	2026-02-05 03:17:16.46776	2026-02-05 04:31:43.861334
39	Mo123@gmammamil.com	$2b$10$bdyruaA/wd75nIR0qmX/wuYhVVqwEiYs9vjmgtQkMhSZcCKksS1c.	member	pending	\N	\N	t	2026-02-06 16:18:45.405264	2026-02-06 16:18:45.405264
42	daondaowid@mguamci.com	$2b$10$hhaxFeRi.al2zKuuhyle2uWENwkjHim5mc3va0Rv.XNBEmZirqv7a	member	pending	\N	\N	t	2026-02-06 16:31:56.227998	2026-02-06 16:31:56.227998
6	working2@example.com	$2a$12$IkoA8BG6u9TMzeUKCWVRyOiQgUKk2jcaqi1BYNDU960wuDs41VljS	member	active	\N	\N	t	2026-01-25 23:49:21.090516	2026-01-25 23:49:21.090516
43	sport.manager@helwan.test	$2b$10$cjDba/oq/OdBeE73TQXe8eWqTUW3pYB1zmO8GoGjU8M1Rts4pfVVm	staff	active	\N	\N	t	2026-02-07 09:00:13.562786	2026-02-07 09:00:13.562786
44	sport.specialist@helwan.test	$2b$10$cjDba/oq/OdBeE73TQXe8eWqTUW3pYB1zmO8GoGjU8M1Rts4pfVVm	staff	active	\N	\N	t	2026-02-07 09:00:15.177933	2026-02-07 09:00:15.177933
45	zeeyad1961@example.com	$2b$10$u.B/ILU5OrsJOKG8hTfLZe/g9r2FPzLbwGC.PMhTzsxwqA2KHNwQG	member	pending	\N	\N	t	2026-02-07 12:47:14.055577	2026-02-07 12:47:14.055577
46	zeeyad1971@example.com	$2b$10$iHthIOtD5xF/YnXXkwv.geLAoL.H1dtFkJ.S9A.zNHrN6eEuoNMD6	member	pending	\N	\N	t	2026-02-07 13:29:31.055917	2026-02-07 13:29:31.055917
47	zeeyad171@example.com	$2b$10$wzpraXRDahq..fa0.7V15.ON5ABwGBo8rGvzFR1kPoBJQmPDIud42	team_member	pending	\N	\N	t	2026-02-07 13:30:43.867315	2026-02-07 13:30:43.867315
48	zeeyad17@example.com	$2b$10$6j7tdY6MU.spgvivjVsSi.AVLepjtExHvYaLnqD8wZkIvGXIVSqte	team_member	pending	\N	\N	t	2026-02-07 13:44:49.346956	2026-02-07 13:44:49.346956
49	newmember@example.com	$2b$10$UTU1WIGtRVWFi30Bn03yFexvJJLVeVQs8MoiwsbptAiNMUxW0..x6	member	active	\N	\N	t	2026-02-10 14:10:10.821548	2026-02-10 14:10:10.821548
60	zeyad@gmail.com	$2b$10$Y/wIh.RIg9Fho.2RksqrI.VJz2mzqlcORnC8qsi.cPut.n4QUgLJm	member	active	\N	\N	t	2026-02-14 13:22:07.797527	2026-02-21 11:18:37.894656
55	kmaged520@gmail.com	$2b$10$W5aRIkdOHuSl1NMlTT9lnONQYgiLgX/ecxiAiNt3JBpPZug2ycfE2	member	active	\N	\N	t	2026-02-14 12:09:56.929939	2026-02-14 12:09:56.929939
53	yara@clubb.com	$2b$10$FsLdlr.dNxAOSPj7X7C.GudHpL.fkzuwkGuVn6ih6SEIGkLhZI52e	staff	active	\N	2026-02-14 00:08:00.405	t	2026-02-13 22:02:42.647061	2026-02-13 22:08:00.789773
54	staff.30305216333333@helwan-club.local	$2b$10$WiKKKTrqiJEh8nGTqtCfl.JrHgjshn7VJ3qhOBom3sIsZLiwuAzOW	staff	active	\N	\N	t	2026-02-14 08:16:34.263582	2026-02-14 08:16:34.263582
56	kmaged2004@gmail.com	$2b$10$58uacHNDQxL6rMlGwlje4eTZqVp8pgiMuBdYUyTxHkf5gxx074U..	member	pending	\N	\N	t	2026-02-14 12:59:02.199372	2026-02-14 12:59:02.199372
31	admin@club.com	$2a$12$iHAZeaDwE1OXvmaCdBprPOrUH99rhC07jvTSP2bjXdrQh.2l8qhkS	admin	active	\N	2026-02-17 19:17:13.106	t	2026-02-03 18:46:32.01891	2026-02-17 17:17:14.078584
57	kiro2026@gmail.com	$2b$10$dg1Rye8Zu2C0ySawtLFvjuat662LJkMHjVyktypujWPi6gjHhqdYK	member	pending	\N	\N	t	2026-02-14 13:00:11.447257	2026-02-14 13:00:11.447257
58	kiro2025@gmail.com	$2b$10$3s1kzEkJmnH55Z0ecOchc.mPYJdQ4QWL9VUkxb35lulLHEY2UsRr2	member	active	\N	\N	t	2026-02-14 13:06:56.582788	2026-02-14 13:08:11.268797
59	kirooo205@gmail.com	$2b$10$ZkPqG6v5q84UFUDTeuRG3.oKXdgmi0vwFpqsi9SLzfQIQQpAtSnha	member	pending	\N	\N	t	2026-02-14 13:17:24.037976	2026-02-14 13:17:24.037976
61	zeyad22@gmail.com	$2b$10$SiusY8JSeFJ/vX/1UWUOrOahdGktU40W/P07CVcY5QYcrUJaSX2.6	member	active	\N	\N	t	2026-02-14 13:24:56.095968	2026-02-14 13:38:27.047797
62	Judy@club.com	$2b$10$KLfMKczLdvxnSMbBV1I0D.lgl6YnQs2sXNulcQEfe5kg.qrPcp8wq	member	active	\N	\N	t	2026-02-14 23:26:00.393445	2026-02-14 23:26:00.393445
29	aaaaa@gmail.com	$2b$10$zjGh4VH0qmaSYeQlZ1iBoOcGGl8W/UaVf5NpyIcn1BDTaS9W8gpSe	member	active	\N	\N	t	2026-02-01 02:13:55.104815	2026-02-22 20:03:51.981673
30	aaadadwad@gmail.com	$2b$10$mQy9q1POwnjQHOqP5bbXburPlbnJYJVKri5DXPUdFJNuo7JG4w43e	member	active	\N	\N	t	2026-02-01 02:27:16.202025	2026-02-22 20:13:23.916995
64	member12345678991234@temp.com	$2b$10$SsEIOfebNarb/LRF1pX24eT6.xkbdDF95My5/Kg5Jy/6fgnJv/mW2	member	active	\N	\N	t	2026-02-14 23:35:46.011142	2026-02-14 23:35:46.011142
65	momomo@gmail.com	$2b$10$yARrgxBoN6RwpW9kLp53P.Jsn.DAeowEIF4o5Kh0m8UhK9dMvS5Na	member	pending	\N	\N	t	2026-02-15 00:20:07.472439	2026-02-15 00:20:07.472439
66	MoM1@gmail.com	$2b$10$AnJOC9wpEIqsMd2ZE6HV0egwqXsJKsZ5hv9y/SwtxExGc6TBDM6O6	member	pending	\N	\N	t	2026-02-15 00:21:11.78456	2026-02-15 00:21:11.78456
40	Mohammed@gmail.com	$2b$10$Xkaf26n13/Pq.NpgllmHg.yAidv4KzRZQOwDFuVMfkPwmgd5woZQG	member	active	\N	2026-02-15 02:31:33.025	t	2026-02-06 16:26:36.577522	2026-02-15 00:31:31.522932
67	Mo@gmail.com	$2b$10$be.Kewhev/.aDnRC1mCBeuP/rtf76l41V7bbap2aYrVJpyN9spp/G	member	active	\N	2026-02-15 02:33:24.359	t	2026-02-15 00:25:15.878491	2026-02-15 00:33:22.854086
68	admin@helwan.test	$2b$10$H.hVh1mtBIV6J1uNonOyietJTCt70YZNsffY7eFmUhm6n6ixaVh2G	staff	active	\N	\N	t	2026-02-15 03:49:04.195114	2026-02-15 03:49:04.195114
63	momomomo@gmail.com	$2b$10$ga63IObU8qQEKaGIkcDd3u1eBHy4TtenYGMlVFfGFK8THqs1p3lx.	member	active	\N	\N	t	2026-02-14 23:33:07.075395	2026-02-15 22:03:00.70576
69	staff.30501050161789@helwan-club.local	$2b$10$sJMBMeO2NJXDBpnenIqnxOgvx16c/t8zdZOGjGKBnkGJvzZU038ZO	staff	active	\N	\N	t	2026-02-15 22:30:13.040715	2026-02-15 22:30:13.040715
70	staff.12345678912345@helwan-club.local	$2b$10$DtTb3ipShesUe/EPcSDV6eCcl/vlYaIV7yhsfh/8tGFptcOnkKEJ2	staff	active	\N	\N	t	2026-02-15 23:05:39.225469	2026-02-15 23:05:39.225469
71	staff.01234567891234@helwan-club.local	$2b$10$Wgibq3P1zTBtmKe51x3Aq.lKfzUANyPV25JGC7DGAcH4AYkfxFY52	staff	active	\N	\N	t	2026-02-15 23:24:26.182008	2026-02-15 23:24:26.182008
72	staff.01234567891244@helwan-club.local	$2b$10$HomFBKulCqn1zJvyMrHSU./felnH6FHwUP9OkRHqLmDJxWuSyJY7a	staff	active	\N	\N	t	2026-02-15 23:34:33.306741	2026-02-15 23:34:33.306741
73	staff.01234567891344@helwan-club.local	$2b$10$qbVwky6PaP6EqLHrc5yogOilVTLQTuo25NmsiDtCPh8P3oPZcG1TW	staff	active	\N	\N	t	2026-02-15 23:35:09.897271	2026-02-15 23:35:09.897271
74	staff.01244567891344@helwan-club.local	$2b$10$JO8gbF93/atd9.Gz1iAIq.BiKE8VupQKqAGNNrHCi5sPf.VFARLYm	staff	active	\N	\N	t	2026-02-15 23:39:08.034601	2026-02-15 23:39:08.034601
75	Media@Club.com	$2b$10$efAyV3GuQxXalioYLzHdTORgdOTslmLc8onJz4McQdU4H.naPr43K	MEDIA	active	\N	2026-02-16 20:23:34.413	t	2026-02-16 07:53:33.563032	2026-02-16 18:23:34.722828
78	1oiiwhadoawd@club.com	$2b$10$2akolyzASU6z912/JaiSoeBOrSwTliVJvsvf9bAQHA2k6H5z61JFu	member	pending	\N	\N	t	2026-02-17 01:05:02.770092	2026-02-17 01:05:02.770092
79	momo4131@club.com	$2b$10$fwhPVfurWyf826CiBtB0Aeu/oHgpHabc4fk0/tdJvpfBzVcMI1oRS	member	pending	\N	\N	t	2026-02-17 01:15:11.20481	2026-02-17 01:15:11.20481
80	momo413211@club.com	$2b$10$89M9x0SsQKJX6OzRuGP7fOo6x.YD9awtt7TAriwLvO6FQKnHezjAa	member	pending	\N	\N	t	2026-02-17 01:24:01.240849	2026-02-17 01:24:01.240849
81	dpoawmdpo@gmail.com	$2b$10$elCK47KXfoAdAWrEjLgt/eA/2V8azzwGebZ7SPyrxHllQGWyTuGPm	member	pending	\N	\N	t	2026-02-17 01:25:27.074858	2026-02-17 01:25:27.074858
100	kk@ll.com	$2b$10$8Wc6UCDQItdMeidXrofrG.Zfx3bqQYL7mUZJ0fVH9ULRrkKJQsNgu	member	pending	\N	\N	t	2026-02-17 21:07:50.097137	2026-02-17 21:07:50.097137
77	Nigga@gmail.com	$2b$10$mmjJNfsv0DZrvtBXhcrspOG.mHrgZL/Rohr9BRAZAYTf6cjucWuxm	MEDIA	active	\N	2026-02-17 15:06:41.918	t	2026-02-17 00:51:01.925513	2026-02-17 13:06:42.750668
82	staff.156198306516165065186186@helwan-club.local	$2b$10$EPVOpjLzbmbTpattyGdP7OcWwnPAAllAEvQK65ZyxW7Le7tR41zW6	staff	active	\N	\N	t	2026-02-17 14:03:54.215239	2026-02-17 14:03:54.215239
83	staff.15619830651616@helwan-club.local	$2b$10$fQ7MUyLMe6dQ2kaJ1aM3IeN/mDUj/dl40D14l.kBE5hB.S.ptSz8a	staff	active	\N	\N	t	2026-02-17 14:04:10.407561	2026-02-17 14:04:10.407561
84	staff.11111111111111@helwan-club.local	$2b$10$XM5NXqWT8UbtkApFuA55ZuZ0TGMgQ.eDlamZn2eG7gApS1L.YCFYC	staff	active	\N	\N	t	2026-02-17 16:09:34.015444	2026-02-17 16:09:34.015444
85	hshshshs@club.com	$2b$10$G9dROI9paxnOiFFOjuit8OMQJtutg5Wl1c4BDJrFtumkzIUi9wUIu	member	pending	\N	\N	t	2026-02-17 16:24:54.850435	2026-02-17 16:24:54.850435
86	Judyahmed@club.com	$2b$10$4xO2mHTKmZ6PtuKh1CtlReKrEkVgtDLBjg0vTtKkpdjFlQi7OiZEG	member	pending	\N	\N	t	2026-02-17 16:28:16.598721	2026-02-17 16:28:16.598721
87	jj@club.com	$2b$10$Fh3jzU/vzkYV1f1MS3dz9OhJlWYWymp9GqkEhOsCpHu1VBjEAKrFi	member	pending	\N	\N	t	2026-02-17 16:44:48.767737	2026-02-17 16:44:48.767737
88	yw@club.com	$2b$10$VyHZD3vum9j3/B54.N4W4Out57hVZ8Ju1/tsRCAbmgX1EB9BZ.SVe	member	pending	\N	\N	t	2026-02-17 17:00:37.93966	2026-02-17 17:00:37.93966
89	yy@club.com	$2b$10$tRlMaCbpeIpoiYjWIFGgPe4VRzRd/V4l6.11UWBsTCc1yGdum0pky	member	pending	\N	\N	t	2026-02-17 17:08:32.227009	2026-02-17 17:08:32.227009
90	yyy@club.com	$2b$10$SXOrlVfTBLyGgcfh7ctV0OUK0kN2wCPN55M6SV/EvkOgrZ1qR60QC	member	pending	\N	\N	t	2026-02-17 17:17:32.06117	2026-02-17 17:17:32.06117
91	staff.11111111111112@helwan-club.local	$2b$10$B.O8ScHE77JEN.IztGT1E.9LY3V4g/F3aEOfbrAOX7Gwel4lNCyyy	staff	active	\N	\N	t	2026-02-17 17:24:10.407256	2026-02-17 17:24:10.407256
92	Mo@gmaill.com	$2b$10$qrNhp5QmgrTa9/VVzcHWNueN8KBY3sAfNF/LH3Xd8lvRHny48TFQ.	staff	active	\N	2026-02-17 19:36:39.847	t	2026-02-17 17:30:46.303207	2026-02-17 17:36:40.820394
93	Testing@staff.com	$2b$10$kmYUPW11durgrLmxnZqGBuol5hGYbKxpIbb7c5TSLDIM24EBp8Vty	staff	active	\N	2026-02-17 20:39:57.798	t	2026-02-17 18:39:32.207814	2026-02-17 18:39:58.765593
94	ll@club.com	$2b$10$S4lL31XZhq7jQoD32..ozuyqqKTQq8V/wEJG3XbBrjEub6KRzCBr6	member	pending	\N	\N	t	2026-02-17 20:20:05.133815	2026-02-17 20:20:05.133815
95	uu@club.com	$2b$10$Q.nEoatyJnZLIOhWF/nNVemefNFh/g3uyi/pF5eDGu2QggX9g/Rsu	member	pending	\N	\N	t	2026-02-17 20:29:56.294074	2026-02-17 20:29:56.294074
96	lloo@gg.com	$2b$10$AjwHxRSE3ceJPLdlppk2eOBtYXRh1Y6vv84ceSWDMzS9ecRnV5oBa	member	pending	\N	\N	t	2026-02-17 20:51:27.434838	2026-02-17 20:51:27.434838
97	ll@pp.com	$2b$10$I5QwDlhKTd7DJ9bXMBKphep/eXqfvxaDCoshSkP0Q4ZTGhHWaqSrG	member	pending	\N	\N	t	2026-02-17 20:58:02.796083	2026-02-17 20:58:02.796083
98	Judyahmed@pp.com	$2b$10$1zjmbRqQ25eyJngrRqtAGuaA0SpQBlg5bwneGdJPqQ3x/m9Zc6kqC	member	pending	\N	\N	t	2026-02-17 21:00:58.844402	2026-02-17 21:00:58.844402
99	jj@clubb.com	$2b$10$wNWf1xEkm6fU9aTHw4FhQOfNSgp4RbZx5dcT.HgRNzqpbrvFGERCS	member	pending	\N	\N	t	2026-02-17 21:05:12.967958	2026-02-17 21:05:12.967958
101	Judyahmed@kk.com	$2b$10$TIOH7MNjxaOhQud.jdJ.MekjdDbOamxtRDF73O5CtHr.nfovjzTlC	member	pending	\N	\N	t	2026-02-17 21:08:44.272376	2026-02-17 21:08:44.272376
50	member@example.com	$2b$10$QHSAqaD8K3EjHXQc/wIV8eGR6w2CgMXAsnBUXfwh1x9CLmc74Nium	member	suspended	\N	2026-02-10 18:30:27.565	f	2026-02-10 14:43:07.531756	2026-02-17 22:31:20.898258
102	Zed@gmial.com	$2b$10$I29MQAHM.73UWD.Ot0itiuHHCJaiA6nz0TNlg3.8GHyJviXHDMc16	staff	active	\N	2026-02-18 00:38:06.186	t	2026-02-17 22:36:40.553702	2026-02-17 22:38:06.715747
76	Sohiala@club.com	$2b$10$m7c5O4BnpdAp.eIFxwbOIucSdcTir3Dx8W.PPT20b/4giEQD6ktSu	member	suspended	\N	\N	t	2026-02-16 10:23:25.031021	2026-02-17 22:54:30.249999
104	ll@ll.com	$2b$10$ljE5fVU3pGy3lyWtMrDbR.wpcAdZo8Sz1IWMxCVuBz5NulQdAygfq	member	pending	\N	\N	t	2026-02-17 23:25:55.539101	2026-02-17 23:25:55.539101
105	ll@22.com	$2b$10$fcMO4BAnEDcteUIw2zCo6O21TXKitUJb.xpMN/5t6rAUB4d69OVKu	member	pending	\N	\N	t	2026-02-17 23:28:50.890184	2026-02-17 23:28:50.890184
106	Judyahmedll@pp.com	$2b$10$z2o48l7AiUEsZbpl9bF/wuBjhqBMJDNOWfKtC6DH71BJbWpDf0YAi	member	pending	\N	\N	t	2026-02-17 23:36:55.818181	2026-02-17 23:36:55.818181
107	Judyahmedll@po.com	$2b$10$jBUEMmO6bkO2YBi1qHXMyuMMklDadcqobLpIOlQ46CiZO7.it3FxW	member	pending	\N	\N	t	2026-02-17 23:40:54.29987	2026-02-17 23:40:54.29987
108	Judyahmedll@oo.com	$2b$10$8SE1htlX9neShjh4KhbBDOsl0ljQ.ld6kngwyUXnje1AWRtY3yPRu	member	pending	\N	\N	t	2026-02-17 23:44:09.753476	2026-02-17 23:44:09.753476
110	ll@poi.com	$2b$10$TFGtKSwJ2NzrLdlsjfkJs.ZmnvClhgigLQJVG3xT6K2GU8PdElu12	team_member	active	\N	\N	t	2026-02-17 23:47:30.873396	2026-02-17 23:47:30.873396
111	member99661144557722@temp.com	$2b$10$P.5jzO2iKTx/Ihu7rVwyleWzGo2yJkBji2dz/9vbIfEZxadLDvM.O	member	active	\N	\N	t	2026-02-18 09:14:27.885469	2026-02-18 09:14:27.885469
103	jj@kk.com	$2b$10$vNy7/3H7aaO9HSe0XweC7OEl7ehjZjzekpE/dEcPD78EC.rZednP2	member	active	\N	\N	t	2026-02-17 23:24:06.366852	2026-02-24 19:20:27.604986
112	member775533662211@temp.com	$2b$10$/695d6RLLeCA8fhtVTj8oudgcs4i9l.fQ20ZEF3c/.a4npnOp0cR2	member	active	\N	\N	t	2026-02-18 09:17:31.959991	2026-02-18 09:17:31.959991
113	zeyadalaa990@gmail.com	$2b$10$rV9Dpq4Dp1U5S.gusdJOyeOdUxoRygEcHCQ2JPJKN9wfqlEXOO9mS	member	pending	\N	\N	t	2026-02-18 11:09:03.945182	2026-02-18 11:09:03.945182
114	staff.11223377889955@helwan-club.local	$2b$10$8BPr.jRF9Im6uOWDUU6fkus88pyawdxQX5NMmrUS5lcQhyk6Ywa02	staff	active	\N	\N	t	2026-02-18 11:38:33.014564	2026-02-18 11:38:33.014564
115	staff.11223377889959@helwan-club.local	$2b$10$fzA02AsFAjt6M5KSHrDgnOZPHmjyODRZYf2.htddqJFVuyhz37HTy	staff	active	\N	\N	t	2026-02-18 11:45:12.061013	2026-02-18 11:45:12.061013
116	zeyadalaa9900@gmail.com	$2b$10$L3IOzlWQHx9OYUjJ9Kt7X.ZjHynSqy8Ye3aUZ20S4i8GHimAdL5sW	staff	active	\N	2026-02-18 13:48:48.41	t	2026-02-18 11:47:12.064598	2026-02-18 11:48:49.263314
117	mmmohammmed20006@gmail.com	$2b$10$yg67AUd3ja3484UCYUD3Xez6qFOXrEkpLWEOQORScsmrzT1o/DGqO	staff	active	\N	2026-02-18 13:52:48.898	t	2026-02-18 11:51:52.382514	2026-02-18 11:52:49.778572
118	ywywyw@club.com	$2b$10$iermpxV7IZ1J4Jb1ZubvAe9OWCSk5wpmfr7SazK.Fn3diAvlBDk0m	staff	active	\N	2026-02-18 14:09:52.856	t	2026-02-18 12:08:32.328171	2026-02-18 12:09:53.735757
109	Judyahmedll@no.com	$2b$10$uNx2UDi48Qd58dmD/FLObeKIOpXsKE6Ne4EtqAd6Q5tAYCgwqY3wu	member	active\n	\N	\N	t	2026-02-17 23:45:43.820817	2026-02-17 23:45:43.820817
119	staff@clubbb.com	$2b$10$q8C50xS66hvG2cKn0kr0M.MD/EGnrx5LeQCGqo5t1Hr4JzJzPHxLi	staff	active	\N	2026-02-18 15:38:56.205	t	2026-02-18 13:36:15.801379	2026-02-18 13:38:56.642346
120	teammember@gmail.com	$2b$10$Fa6X1B8z/CefaljgQ6W8cuVDr.yptKSj84MAVoiYboYoyJAXnsE3q	team_member	pending	\N	\N	t	2026-02-19 08:30:02.345505	2026-02-19 08:30:02.345505
121	teammemberr@gmail.com	$2b$10$y0Nt3SQL9AI9X237Onu20.zjvaIHe.LiU6bRiSrVSA2BbNdyqjFXu	team_member	pending	\N	\N	t	2026-02-19 10:52:33.00239	2026-02-19 10:52:33.00239
122	teammemberrr@gmail.com	$2b$10$tabpkT2zHUj1B58/LPP83e4Na4LLC/qjUqzdsB.Qler/xI3ADHVCK	team_member	pending	\N	\N	t	2026-02-19 11:10:44.942695	2026-02-19 11:10:44.942695
123	teammemberrrr@gmail.com	$2b$10$p3usNrOWOK/JdIZW7XPUEeKZpwjSY3UTuwFEybhpu5vvdSlIzoIg2	team_member	pending	\N	\N	t	2026-02-19 11:17:27.576737	2026-02-19 11:17:27.576737
124	teammembeerrrr@gmail.com	$2b$10$rE3obWOuFP9b8SrqlkOGge/9ac6y8pZE9Bvqwo7hGCNFAo9XP91Qe	team_member	pending	\N	\N	t	2026-02-19 11:28:50.991603	2026-02-19 11:28:50.991603
125	teeammembeerrrr@gmail.com	$2b$10$zFfd/.0qIjX/ieXVKMsZ.egMKfSouPRL0fn8KxXcanPaqVgAxJiqm	team_member	pending	\N	\N	t	2026-02-19 11:41:44.936786	2026-02-19 11:41:44.936786
126	teeammmembeerrrr@gmail.com	$2b$10$YBPybTxOOXpXseJgpyqL0eGPP04MQIIn1vo.Gn2H8ZZUggTr5Llj2	team_member	pending	\N	\N	t	2026-02-19 11:52:44.94279	2026-02-19 11:52:44.94279
127	teammember1@gmial.com	$2b$10$VkzrAbLsrgyoKv5OuktRL.k2LwZ5z9EhXSaCHcjy3gh2rDvF4DGMu	team_member	active	\N	\N	t	2026-02-19 12:08:20.337907	2026-02-19 12:08:20.337907
128	22@gmail.com	$2b$10$0z83ImK/a.LGzQdVFVsyaO4Kl7WkFgKCtWZZTB6lqG/jtN9t9iGna	staff	active	\N	2026-02-20 01:30:41.3	t	2026-02-19 23:30:07.818997	2026-02-19 23:30:41.521184
129	staff.12444444444444@helwan-club.local	$2b$10$S8r3SejxZUK3y43Z.P0vpueHd0iS/S12edx.0ZT8VT2qycbiEcY5.	staff	active	\N	\N	t	2026-02-20 13:24:03.672443	2026-02-20 13:24:03.672443
130	staff.12444444444443@helwan-club.local	$2b$10$BIMKDunaKv7XdDya0nZQMuzrF2.PCaEVQszJkrAjT.5zNGEDjESZi	staff	active	\N	\N	t	2026-02-20 13:27:35.693387	2026-02-20 13:27:35.693387
131	Stuff@staff.com	$2b$10$3m.O2xuSzlZ0QqiSQJaCA.skqhd9T4GFoKSw8R48S9F38pqqToVSm	staff	active	\N	2026-02-20 16:54:10.973	t	2026-02-20 14:50:23.712315	2026-02-20 14:54:12.68887
132	staff.11111131313131@helwan-club.local	$2b$10$xvZmK1Er1sZ7oOubtYXmM.929G2QKHbMit9mH.dUgcxtr9NQU5sBi	staff	active	\N	\N	t	2026-02-20 14:55:40.782369	2026-02-20 14:55:40.782369
133	Moooo@gmail.com	$2b$10$i8HF8MRt/U6vKYRa6bpY4enbN19YGSpKzrtdN7kKP9qTjVtu8h4l2	member	pending	\N	\N	t	2026-02-20 15:00:20.784578	2026-02-20 15:00:20.784578
134	Mooood@gmail.com	$2b$10$f6CN9BExki13uStVonXvB.ZRITlWN8wibtuJTCIxDtPYJyG2Qx01u	member	pending	\N	\N	t	2026-02-20 15:02:18.790194	2026-02-20 15:02:18.790194
135	Moooodd@gmail.com	$2b$10$Pb52sVOX04B2FrzXEO7Fb.swTNbYf/3wH89g6tEDWMmP/pe6fHlh.	team_member	pending	\N	\N	t	2026-02-20 15:04:48.224604	2026-02-20 15:04:48.224604
136	kk@lppl.com	$2b$10$cmHgBADmoIZ/vnhmrN57MOc0Pz1b.nE1YtzhOQct.QeQ4owVjL6uW	team_member	pending	\N	\N	t	2026-02-20 18:13:13.901656	2026-02-20 18:13:13.901656
137	emp@club.comm	$2b$10$YNuMP8JEShGs/nP6c2AO5umt2jX65WZSvAmljoQLj3eQ6.xxcmPf6	member	pending	\N	\N	t	2026-02-20 18:30:34.3579	2026-02-20 18:30:34.3579
138	Momomomo@gmail.com	$2b$10$uNMIAcVg7RDPmfM5eit6Due0.kuniHsxoposRoWnlJ13ZaHjq1RlG	team_member	active	\N	\N	t	2026-02-20 21:29:11.551797	2026-02-21 01:13:27.02848
139	omar@club.com	$2b$10$KzsvYZw4YQpBn48zYRnUUus9AoDknn8dFJElBkzjPwUptZm4zx4NC	team_member	pending	\N	\N	t	2026-02-21 02:07:50.729311	2026-02-21 02:07:50.729311
141	mo@club.com	$2b$10$tXpqNGSemgtSL4UcKkxOaOGHSgmEpt/kuVH9aWdayfF/OoNVDkO0S	team_member	pending	\N	\N	t	2026-02-21 03:15:42.726567	2026-02-21 03:15:42.726567
142	farida@club.com	$2b$10$Bxkr6MawRLoSaBNfk9LNPOsdNmq2Q9RnjSVk0jmbzNRCDHJamaws2	team_member	pending	\N	\N	t	2026-02-21 03:27:29.030897	2026-02-21 03:27:29.030897
143	you@club.com	$2b$10$lLdfL8G6AQMJptoxaPlovOjGrtz6/vD/fKaLonvSdRcNj5J5xoZLm	team_member	pending	\N	\N	t	2026-02-21 03:40:15.493954	2026-02-21 03:40:15.493954
144	yaraah@club.com	$2b$10$kx/lt/jVw0bKaoS.JQYxnO0noLjojrAwRN4Mf6jp452XHGtRVATIe	team_member	pending	\N	\N	t	2026-02-21 04:03:10.299737	2026-02-21 04:03:10.299737
145	player1@example.com	SecurePass123!	team_member	active	\N	\N	t	2026-02-21 04:55:38.974958	2026-02-21 04:55:38.974958
146	player11111@example.com	SecurePass123!	team_member	active	\N	\N	t	2026-02-21 04:56:29.413239	2026-02-21 04:56:29.413239
147	email@club.com	pass123	team_member	active	\N	\N	t	2026-02-21 05:22:47.800163	2026-02-21 05:22:47.800163
148	TMember0@gmial.com	$2b$10$vCaHV6Y6V2DUY0dJgPlNeeUTAg4aRByrRIfp6ojV4rjEc.9xZN5lG	team_member	pending	\N	\N	t	2026-02-21 09:51:34.520616	2026-02-21 09:51:34.520616
149	TMember00@gmial.com	$2b$10$xN8EYocCaD605FH/j/tQhurJgGAKjvfR6TuNKNOjWdlohZlv8Jwx.	team_member	pending	\N	\N	t	2026-02-21 09:54:45.518136	2026-02-21 09:54:45.518136
151	TMember02@gmial.com	$2b$10$n/Sd3R9qTtfH9darP.v46e3evzrXlYmyg3Eo.whlfYEd5BeFcnVJW	team_member	pending	\N	\N	t	2026-02-21 10:01:39.447037	2026-02-21 10:01:39.447037
152	TMember03@gmial.com	$2b$10$DRlzwPQGczlZFaDQEgUxEuk64zh2x.jkLZHBI8nfsRPSRTstnI/uC	team_member	pending	\N	\N	t	2026-02-21 10:05:10.535582	2026-02-21 10:05:10.535582
153	TMember04@gmial.com	$2b$10$mmM92nVQyxgshEfefuRoSe4wwaYO6C/1C2BhUMUXkRv8pPwBQ1A4G	team_member	pending	\N	\N	t	2026-02-21 10:12:50.07269	2026-02-21 10:12:50.07269
154	TMember05@gmial.com	$2b$10$5.3Zh4arjdHWK0oFYUuEeeMPYjumnnBDpEuRt0ARqwtPV308cyW1i	team_member	pending	\N	\N	t	2026-02-21 10:13:42.663661	2026-02-21 10:13:42.663661
155	TMember06@gmial.com	$2b$10$zVDGiR4MdLpp1XLL2zLOzOt/b4n5bu4m5BxiQWCHgZAA0uATwATtS	team_member	pending	\N	\N	t	2026-02-21 10:17:53.384388	2026-02-21 10:17:53.384388
156	TMember07@gmial.com	$2b$10$VtHhEqrrbaZ/nSM5MdAQieKSf5FIWwhLwBroAq2p8H1qmd.G.tYey	team_member	pending	\N	\N	t	2026-02-21 10:24:46.402139	2026-02-21 10:24:46.402139
157	TMember08@gmial.com	$2b$10$xied9mR6qv/8kvSBvmp1j.qcJDhOnVmYwKVrX6e3Kx70prD3WCVze	team_member	pending	\N	\N	t	2026-02-21 10:33:11.05628	2026-02-21 10:33:11.05628
150	TMember01@gmial.com	$2b$10$1jjIOnt0/0WTz8OvmnQR9.DwPaGDfff4RZ/0mNmdBux88zQxYb3.u	team_member	active	\N	\N	t	2026-02-21 09:57:16.285549	2026-02-21 11:18:28.454395
158	TMember09@gmail.com	$2b$10$W6I.3bHmYTLq5c1XQz78PekocCeo7UPwOxPmMMvmGHN/B8LK/dI6u	team_member	pending	\N	\N	t	2026-02-21 11:24:55.411996	2026-02-21 11:24:55.411996
159	TMember10@gmail.com	$2b$10$VVoDItQMjs6vkyN07etBbOD.TFQSzI99Vx/czKWEKoTJPzAlO8wvy	team_member	pending	\N	\N	t	2026-02-21 11:26:26.697848	2026-02-21 11:26:26.697848
160	TMember11@gmail.com	$2b$10$vR99Gdpk6ZbUo238Gj9spu2kepWGyoJWIVhtw6Yg39L0E23V4JFYC	team_member	active	\N	\N	t	2026-02-21 11:28:49.104494	2026-02-21 12:24:41.917903
161	TMember12@gmail.com	$2b$10$SS7ARQ5eADos4IA9RByM9O4kxSdZu10ShH0VHRYhnY7hCO1YYx9PG	team_member	active	\N	\N	t	2026-02-21 11:29:36.844017	2026-02-21 11:53:00.478715
162	omar@gmail.com	$2b$10$pbeBkEmB0yPOXpq35x8r9.6mBSZLJzHTmqZB6NI5zsjjuDWi9dXUu	team_member	active	\N	\N	t	2026-02-21 11:58:56.676573	2026-02-21 11:59:56.552113
163	ahmed@gmail.com	$2b$10$ryXtIgfKMq0yWw1xKNAlhu4cSWnrPqUbsx5H7h.sPcYHHL6Ek4Og.	team_member	active	\N	\N	t	2026-02-21 12:19:17.763856	2026-02-21 12:19:57.955235
164	MOMOMOM@gmail.commm	$2b$10$phMAzUvxJnGq53nZzg.P1O3Y2pA2CGQ9TzAY2b1eqVbz/rQPmoLt2	team_member	pending	\N	\N	t	2026-02-21 12:55:16.284489	2026-02-21 12:55:16.284489
165	ddddd@hidelux.com	$2b$10$OFAjv2JJ9q7B1czKAF1Eo.mBV8Cj1X4rVEh8UrhRDnAxdoxAnQ9nm	team_member	pending	\N	\N	t	2026-02-21 12:58:01.626371	2026-02-21 12:58:01.626371
166	hr@club.com	$2b$10$mFOnY2slpeIrj.jHJo0MC.JpPQAxC5Z/CDjUtmSwVgTl7/o9CrKWW	staff	active	\N	2026-02-21 16:28:19.798	t	2026-02-21 14:27:20.275403	2026-02-21 14:28:20.182659
167	rahma@club.com	$2b$10$qg85ywxJLjeAQjIL5zZTO.14rRXf73jdnw9F3.qILmADHzwCKNQwW	team_member	pending	\N	\N	t	2026-02-21 14:40:27.129785	2026-02-21 14:40:27.129785
168	mm@club.com	$2b$10$iYlFhWonFboQrQ5h3LSfSuoGXAuByKbvvN2IbhbnbQuacJRtBGcnu	member	pending	\N	\N	t	2026-02-21 15:40:10.666852	2026-02-21 15:40:10.666852
169	amr@club.com	$2b$10$N1wNEPTsF68bze1SjCaGhOMxcsqcC1OJlseo9k.w/v9s6q8YF79Ha	member	pending	\N	\N	t	2026-02-21 18:04:09.154125	2026-02-21 18:04:09.154125
170	nn@clubb.com	$2b$10$F0/LfmKVQaOZUz9kdRQtjuoRq3QEjrhaAuvzgW49FeaIHdvAaf342	member	pending	\N	\N	t	2026-02-21 18:12:57.685821	2026-02-21 18:12:57.685821
172	kk@mm.com	$2b$10$UblJ8BIQW44jASZWEDKLnew.qY19XLGwksa4JJHh4OKbghXLclFG2	member	pending	\N	\N	t	2026-02-21 18:23:36.922938	2026-02-21 18:23:36.922938
173	ypy@club.com	$2b$10$9bouU4043h50kuJ3v5.htOrmEOqi3aTXxcx0cgHqyJFJT7tpmpGIC	member	pending	\N	\N	t	2026-02-21 18:30:01.322797	2026-02-21 18:30:01.322797
174	bb@club.comm	$2b$10$2SG/d/ma8PIUX1NK0.klC.VLHeLIcEiI70OA.37XVEPkLV0W7fmC2	member	pending	\N	\N	t	2026-02-21 18:36:15.008918	2026-02-21 18:36:15.008918
175	hh@hh.com	$2b$10$xS.EUvaif699EukWs0sheeZRC3OS/R5JQEtncVNRVyu7aKsRppwBy	member	pending	\N	\N	t	2026-02-21 18:45:08.212674	2026-02-21 18:45:08.212674
176	yoy@club.com	$2b$10$genBNxQqNWjZWwGJeP.cze8yQ8nGNiw14J8t2XasiQaYJ.7JaUge6	member	pending	\N	\N	t	2026-02-21 18:54:28.197894	2026-02-21 18:54:28.197894
177	ll@d.com	$2b$10$rdjNKFSWb2TrXK/HNoWxaOMvwplz9fWyz3HUUSs60dKEwuqnHL6my	member	pending	\N	\N	t	2026-02-21 19:25:39.633859	2026-02-21 19:25:39.633859
171	mohamed.h.elnahal@gmail.com	$2b$10$OslbsBloqx3FcLGaxASEael2nz4GaXr9XQ9B0YAiQ3XZkjxQ7H1nq	member	active	\N	\N	t	2026-02-21 18:13:38.226505	2026-02-21 18:13:38.226505
178	mohamedsalem@gmail.com	$2b$10$KKmvusFrbNy8nC.eSRp4te1JDo55r2DLE1QJtXkJ9i06O5vubbVZG	member	pending	\N	\N	t	2026-02-21 19:35:28.339732	2026-02-21 19:35:28.339732
179	st@udent.com	$2b$10$xt77380ALAf9Z0n6Iq07e.rNh/yeVLGstthn360ziHfPp3cnGoX4S	member	pending	\N	\N	t	2026-02-21 19:53:14.305091	2026-02-21 19:53:14.305091
180	memo@club.com	$2b$10$y7d5fTN8UbaFyvEWKKx1du/2F9bBGhY3X9PZj1KHMVEk5CeewBNAS	member	pending	\N	\N	t	2026-02-21 19:56:47.778695	2026-02-21 19:56:47.778695
181	jj@kdk.com	$2b$10$GQN1jInsiAWVhIDjjb1Qfuizp50.tufaz3Ox7qcZ1IqjoRURDQ6Ue	member	pending	\N	\N	t	2026-02-21 20:02:26.634507	2026-02-21 20:02:26.634507
182	fayrouz@kk.com	$2b$10$23yUVt49w34G6CXRi42XbOhFOuYyJ4ahy5WTUjMGqcGpUAwqJB5Aq	member	pending	\N	\N	t	2026-02-21 20:10:53.494865	2026-02-21 20:10:53.494865
183	emma@club.com	$2b$10$axCh5MAQJ41e2P.Wg.WNhem/Lwr5ZnzhAyZeGq56lHy.2OLk1.fEu	member	pending	\N	\N	t	2026-02-21 20:13:00.688602	2026-02-21 20:13:00.688602
184	emmma@club.com	$2b$10$nnwmjA6l/4y82NecmhF4OO0RGwCfd9XGRsWCV3I6zkhfKOSDbQCke	member	pending	\N	\N	t	2026-02-21 20:21:19.524921	2026-02-21 20:21:19.524921
185	jjudyy@clubb.com	$2b$10$JoqA5IECAlPLI8i47PqYaeU/aBmStpZdJgzanYI.qcjwZ/3rVlsAi	member	pending	\N	\N	t	2026-02-21 20:23:39.117345	2026-02-21 20:23:39.117345
186	kk@lllll.com	$2b$10$AwgyLsYVHGpIT3XIj61eDeZ9ZFYjJHn4LFbVuBL1TOH06q81ogt06	member	pending	\N	\N	t	2026-02-21 20:31:50.620175	2026-02-21 20:31:50.620175
187	yyaa@clubb.com	$2b$10$8AebSGAfIPsTdJv8sL5mCec5fwkAAiB1F6PQUp0VcYxG0VZkKzduC	member	pending	\N	\N	t	2026-02-21 20:36:21.333427	2026-02-21 20:36:21.333427
188	newemmp@club.com	$2b$10$Qvsv63mcrOz/O.dfh2ukQem0Mmk/M4ntgJSHs5DDRsCuVGVdXGy92	member	pending	\N	\N	t	2026-02-21 20:42:22.291982	2026-02-21 20:42:22.291982
189	DD@club.com	$2b$10$cURbAUe1.NEyGcCtMw0B2.FGK4dlAjgNL7Ql1TTMxFUdD6iryZPCi	member	pending	\N	\N	t	2026-02-21 20:52:29.932461	2026-02-21 20:52:29.932461
190	kmaged522@gmail.com	$2b$10$/9xVHGZQQP3XazYiNsWp9.eNk7sIYVLsf0jeh/wQh1Y9n.SLkET5u	member	pending	\N	\N	t	2026-02-21 20:56:01.406709	2026-02-21 20:56:01.406709
191	newll@club.com	$2b$10$5JRlvIlQzmaCzj2kFhimlumL5SIFEG8kuGRYFnGsk2Qg0kREtlese	member	pending	\N	\N	t	2026-02-21 20:56:15.269212	2026-02-21 20:56:15.269212
193	kmaged523@gmail.com	$2b$10$7O90hIL8F80aGrdiIbKdte/GwtykiBuPai7U61DH8AyXpHKwi6KJ6	member	active	\N	\N	t	2026-02-21 21:04:00.274782	2026-02-21 21:12:07.819158
192	jj@llkk.com	$2b$10$8h3Y5Sd0Qo5tJHJFS4Vdte1UduGPlAffblYkZSAJ0aa/Nqkvy1Zmq	member	active	\N	\N	t	2026-02-21 21:00:36.01239	2026-02-21 21:12:23.378922
195	new@clubbb.com	$2b$10$2JjL3Wetu07/L97Y3clOH.5bG2OAsrwjFHl7dbh5uVOeSUTZjOTLy	member	pending	\N	\N	t	2026-02-21 21:12:36.800046	2026-02-21 21:12:36.800046
194	kmaged524@gmail.com	$2b$10$v3xY19QHpd5cq7ZCx9Lx3usV99V4kEhKI/PFBaEc1ZNHOyP2u1vpO	member	active	\N	\N	t	2026-02-21 21:04:47.246236	2026-02-21 21:13:12.815689
196	kmaged525@gmail.com	$2b$10$8tXYsRaDaQEeIIFqGHLzHeGC12h53xYKfpmo2.0O0aZU02Irb27Zq	member	active	\N	\N	t	2026-02-21 21:16:27.291379	2026-02-21 21:18:06.845545
197	yara@example.com	$2b$10$0fhgpGmgs2ofNp9kkCA8aeDrPBZTlVIslQGU19J1JBi3qOcjCxQwC	member	pending	\N	\N	t	2026-02-21 21:31:16.623971	2026-02-21 21:31:16.623971
198	kmaged526@gmail.com	$2b$10$vwJNtQAB4xw1kuEEDsfhweC1iBybX6Zv6dCD5p95/zGT.lWZYHjLO	member	active	\N	\N	t	2026-02-21 21:33:05.702925	2026-02-21 21:34:52.98827
199	new@yara.com	$2b$10$OJohojO/R5amfq8ofLG/dODBdvFQmsewOzdE2ILqv.Zd/n2dlcYv2	member	pending	\N	\N	t	2026-02-21 21:38:46.746038	2026-02-21 21:38:46.746038
204	kmaged530@gmail.com	$2b$10$tWzHsENRKDyZHWfNNjrj1ulFjLN9k3oNE4eZab3vXHhp7DHeznr7i	member	active	\N	\N	t	2026-02-21 22:43:49.253569	2026-02-21 22:44:49.131824
203	kmaged529@gmail.com	$2b$10$SjO8V2QZ62EXsaFPhJ1.2.5.U3HBaMCN2jh.2/FyJW2FkSAk2mf46	member	active	\N	\N	t	2026-02-21 22:41:26.123234	2026-02-21 22:48:30.573091
200	kmaged527@gmail.com	$2b$10$qwlnlZsq91QTY89UR5uWz.6WuphFyEM1gcOlCpbw4zszfOi2KPvKu	member	active	\N	\N	t	2026-02-21 21:42:10.330572	2026-02-21 22:11:43.515881
201	mohammed@gmail.com	$2b$10$D6073z3Bod.aoJtRJ6T7oerx8bqUomchHUsjQGuHt4WNbht6HrQ4G	team_member	active	\N	\N	t	2026-02-21 22:34:31.647209	2026-02-21 22:36:02.088511
202	kmaged528@gmail.com	$2b$10$Bjdt4eNQeT35fjRHXxmNeur1JFRIFnKlceT2ShEbFAQNq7g87uQMi	member	pending	\N	\N	t	2026-02-21 22:40:23.938312	2026-02-21 22:40:23.938312
205	kmaged531@gmail.com	$2b$10$8MVoeoFclowCmLOCvmBd/OjU558WyQXKU2Cmhj7DpCgqlJqO6/d8q	member	pending	\N	\N	t	2026-02-21 22:51:09.916613	2026-02-21 22:51:09.916613
206	kmaged532@gmail.com	$2b$10$qZIj149Cnq0Y6jw5bJFJSOjJYT3g5t6KrQbzWA6YZJ3fSa3MOw4He	member	pending	\N	\N	t	2026-02-21 22:52:30.5962	2026-02-21 22:52:30.5962
207	kmaged533@gmail.com	$2b$10$cJS8dafTMhzBCSTNjGM7OegBQXsVoEX1QkPaq5H1Iht1nU5e9x6z6	member	pending	\N	\N	t	2026-02-21 22:53:20.54367	2026-02-21 22:53:20.54367
210	kmaged536@gmail.com	$2b$10$puIyolGSbc59K5FCyq9a1e414Uj99qAzKAEYYmuUCyqK3CUcEuEtO	member	suspended	\N	\N	t	2026-02-21 23:21:51.84257	2026-02-21 23:32:04.520381
208	kmaged534@gmail.com	$2b$10$ON731Sf9YCQYwhCOmazA9.iR0t32ZF3TuhSfyD.HUvAXoxxIyCDuu	member	cancelled	\N	\N	t	2026-02-21 22:54:13.751705	2026-02-21 23:37:18.869275
211	kmaged537@gmail.com	$2b$10$0tUMuLDHPd2VrcJeCaTA3e52VCJpdvObjhPvyOhIlbsT1hB7jWreC	member	active	\N	\N	t	2026-02-21 23:36:05.146503	2026-02-21 23:37:29.832056
209	kmaged535@gmail.com	$2b$10$IzN1TJEbiBtld8IrFXIKVOmhelAIxWCHqd1jfeBFyOfs9qCtiWx42	member	active	\N	\N	t	2026-02-21 23:21:03.692278	2026-02-22 00:25:39.865126
213	kmaged539@gmail.com	$2b$10$UE9PkWgRPvkubQi63gAW9ObbFYuepKkD2tYi1BsnT5M/gpQ4cq4vK	team_member	active	\N	\N	t	2026-02-21 23:49:15.885345	2026-02-21 23:50:21.335024
214	ahmed0@gmail.com	$2b$10$bQGtLPlx9VHMBxVWEl3MEeSiEPZahyb9pmeMMWEgyCLMvyBp0w8xy	team_member	active	\N	\N	t	2026-02-21 23:57:12.649644	2026-02-21 23:58:28.501605
215	mohammed0@gmail.com	$2b$10$U1wKupFIC/egsb2kMhaOTuzTIrKX3u6ZVe9LXS9L7OybsOd9zA1he	team_member	active	\N	\N	t	2026-02-22 00:18:11.307248	2026-02-22 00:19:13.679211
216	kmaged54@gmail.com	$2b$10$2ER651vIxFw5T5dpWNZpLuMU6Od/7DG3yfUrdJjSKZD9A3CZ3ci7y	staff	active	\N	2026-02-22 02:23:15.634	t	2026-02-22 00:21:29.541359	2026-02-22 00:23:24.154932
212	kmaged538@gmail.com	$2b$10$8Kg5hknmq0a3J6INNt2YgOST54QNaqTQg7gd6NCCw6lV9itdWdoD.	member	suspended	\N	\N	t	2026-02-21 23:42:25.614385	2026-02-22 00:25:54.97769
217	Moooo@stafff.com	$2b$10$ZCNS1q2I/2dT5UozJO5fOOg3/WrZPRV.bssOrZbrHkjfFQpYe3kja	member	active	\N	\N	t	2026-02-22 04:06:58.250897	2026-02-22 04:38:13.084419
218	admin@helwan-club.local	$2b$10$WQWpWLLTah3no8sTgf/zWumkkMYXryRKjK6sdFcuqz4AihB8q9H3y	admin	active	\N	2026-02-22 15:03:44.762	t	2026-02-22 13:03:45.901032	2026-02-22 13:03:45.901032
219	Stuuuuf@gmail.com	$2b$10$3ZzUN.H5YOM4HFclYOUhUejgH4g8ttjA3VghKpsy6IAM7/e.TmSo.	team_member	pending	\N	\N	t	2026-02-22 20:03:45.921201	2026-02-22 20:03:45.921201
220	StaffMemeberAdd@staff.com	$2b$10$KCDyqo8lTUIr.hiA2hRbn.VxTusprbIvJeje7ILMJDXQIoVShMd3m	member	active	\N	\N	t	2026-02-22 20:10:52.584841	2026-02-22 20:10:56.21887
221	StaffPlayer@player.com	$2b$10$3FOH7seXkkV7l567zK3RzOKqFWTP73SZ56I0hs4YJme.nw3I1jGQ6	team_member	pending	\N	\N	t	2026-02-22 20:13:19.149199	2026-02-22 20:13:19.149199
222	Staffff@staff.com	$2b$10$m.uqHMD2bNsWyn1iBujiiuvoyiTg9DDLtuUvW/voEz/cofRjB5jDO	staff	active	\N	2026-02-23 00:37:54.637	t	2026-02-22 22:37:30.466988	2026-02-22 22:37:55.002047
223	momomom@gmail.com	$2b$10$iIjhzV2rxc5ISn.jnjft.eElRNrUoVJtLBrBlcReocbJ6p0JFW/lu	staff	active	\N	2026-02-23 00:59:49.423	t	2026-02-22 22:58:43.213185	2026-02-22 22:59:49.838925
224	YaraStaff2@staff.com	$2b$10$e8WBPInofpgEXmEIJw1ZveqQClIxw3Mg6caMGQJVr51JZ7HgD9sEC	staff	active	\N	2026-02-23 01:34:14.635	t	2026-02-22 23:33:46.229691	2026-02-22 23:34:15.112952
225	a@gmial.com	$2b$10$3UhNW49emWsu.KS1xRCH8O78mkN8JnZzL636qg6PBgcY9J6LNZFmK	team_member	active	\N	\N	t	2026-02-23 08:15:02.649725	2026-02-23 08:16:59.355729
226	m@gmail.com	$2b$10$T7mTkJ7VdT83Biugkb7DeuPLtFtDi0xGL1bTZAcF91rHWeGQibef6	team_member	active	\N	\N	t	2026-02-23 08:39:55.439399	2026-02-23 08:41:01.070704
227	mt@gmail.com	$2b$10$bW1QBDMbRguPfady4zQYEOmfo/j1slvRHzwEeWNpqQxTW5rbaEQiG	team_member	active	\N	\N	t	2026-02-23 09:03:47.788561	2026-02-23 09:06:29.226696
228	mtmt@gmail.com	$2b$10$GpfI4wSLiiNXv1niXC9GQ.QgA5YI1oTiBtVnOmh.TcN4P2n88z11q	team_member	active	\N	\N	t	2026-02-23 09:29:44.390888	2026-02-23 09:31:21.060727
229	y2@gmail.com	$2b$10$7ecrg4Iq96dbATLZajFaIuJTIwJ5HlfmtjXpVDpKAjGxsmaFMPAAS	team_member	active	\N	\N	t	2026-02-23 09:42:39.943693	2026-02-23 09:43:40.185607
230	aa@gmial.com	$2b$10$IU75yHyFQuXstm1.bEz81uwqG6HHdZvOGBCV.9OaHZA4J0mLUU/RK	team_member	active	\N	\N	t	2026-02-23 09:48:28.197008	2026-02-23 09:49:12.949737
231	MImoaiwmdawd@gmail.com	$2b$10$Cv0Wnyhite103jJDLJOWGOsrCgvCIQWZuylTsdOfJuowdQkuh6cJy	member	pending	\N	\N	t	2026-02-24 00:50:18.81992	2026-02-24 00:50:18.81992
232	Wegzzzz@gmail.com	$2b$10$AVQrZu.gfJIUYVDIqK0fGeKzBsE3XiXA6IZEhct9FB/TaRE.d1lDC	member	active	\N	\N	t	2026-02-24 00:53:13.761556	2026-02-24 03:17:00.963002
233	memberrr@gmail.com	$2b$10$4RInVO8qeKLWtzAn5AUrruOPXiJ43D6NvcNLdrbU.uDxn69wtcafG	member	pending	\N	\N	t	2026-02-24 12:32:55.806135	2026-02-24 12:32:55.806135
234	memberrrr@gmail.com	$2b$10$ZJCoecJreuMtVvyr4qJz2O75x/Ag437TcWEQvTQTmjsLEozUe9vQy	member	active	\N	\N	t	2026-02-24 12:33:54.549611	2026-02-24 12:35:17.432952
235	Kmaged5200@gmail.com	$2b$10$xnSYvarzsBErHJdd185/HOrf7KVRuMZfd1QGwcenX3FEhVpu2CUwK	member	active	\N	\N	t	2026-02-24 13:21:40.059352	2026-02-24 13:32:31.793679
236	Kmaged5@gmail.com	$2b$10$9wOqQRaHICKfh//5hzLFGu3LghWO66GOno2dZBhxQH3HeYle8HJ/W	member	active	\N	\N	t	2026-02-24 13:47:03.772725	2026-02-24 13:47:33.738952
237	Kmaged0@gmail.com	$2b$10$/JAIifCL5mwuR0eY6W/pUeQ9GbumJSO2CC566lWd6Ob4e2uzAgg2S	team_member	active	\N	\N	t	2026-02-24 14:11:58.740253	2026-02-24 14:15:13.286237
239	memberr@gmail.com	$2b$10$M6D//ELEfXFl33/o6f86luLjApOswcpY8NHyh5slVVafCRbzK7.vS	member	active	\N	\N	t	2026-02-24 14:46:48.470791	2026-02-24 14:47:24.62002
240	Kmaged00@gmail.com	$2b$10$el0QHaI9bcupJnQ2gVu7y.Y6IyCTgCo6a0GKZBqPuSQDRSRmND2ty	team_member	active	\N	\N	t	2026-02-24 16:02:34.36588	2026-02-24 16:04:07.166896
246	Stafffffff@Stafffff.com	$2b$10$XmAzC9.i7TT4WxOevrtdCOG95l5Gy0HXwRur61KmEZ5NKCWKITdIu	staff	active	\N	2026-02-25 06:05:32.119	t	2026-02-25 04:05:01.593771	2026-02-25 04:05:32.361516
247	Apwjd90awd@gmail.com	$2b$10$noaDIHPLgkH/uM/syPb7XuYg7g3ysP81Thi0Q1JI1G9vGlkC30xbO	member	active	\N	\N	t	2026-02-25 04:27:56.068922	2026-02-25 04:28:04.746485
245	Moioooooo@gmail.com	$2b$10$Rzal00egjat3UtWoMTw5Den12t8gY4bXvg9s8WRBFTbbsOkYsl7JS	member	active	\N	\N	t	2026-02-25 02:28:55.989496	2026-02-25 04:45:11.336229
238	durrah@g.com	$2b$10$sTuR2jD/uwn9gy6oSf.WP.ermmh41Bj..uTCuoU5Ilho8idPZwLzG	member	active	\N	\N	t	2026-02-24 14:45:11.841433	2026-02-24 17:19:16.021689
241	taleb@gmail.com	$2b$10$T48MZ.2W7VIGJJyubkMV7uXwP2x.oOysQX8dkqOLIZ/73tKDTjZjG	member	active	\N	\N	t	2026-02-24 18:42:06.397335	2026-02-24 18:43:12.591673
242	Mohamed2@gmail.com	$2b$10$MFKw17DrH2rjBY/GFNoH.Of0GNZOulEZmcR65m3n5ZAz9ybZEp1gW	member	active	\N	\N	t	2026-02-24 19:24:09.098495	2026-02-24 19:24:48.385068
243	z@gmail.com	$2b$10$Ms3jPVqZCp4c2YAOKjL/EuhnHmKxb68Ut/DvzuLyB5j11bU3inXqm	team_member	active	\N	\N	t	2026-02-24 22:47:41.00066	2026-02-24 22:48:29.371237
244	cc@gmail.com	$2b$10$SIReQzKelAmtXi4Um1sVSuHLoPb.Pp511.70v3WwVeTQGfvzCOBB.	member	active	\N	\N	t	2026-02-24 23:18:02.433392	2026-02-24 23:18:04.037961
249	ford@gmail.com	$2b$10$oqTE8YlHF.AznX7IRYyUbevu4CCPPeqd010H2PcypYtsxl3rGiIYy	member	active	\N	\N	t	2026-03-01 03:04:58.029378	2026-03-01 03:07:47.579318
248	marmosh@gmail.com	$2b$10$3bftMffh0l3eVe.wXPKhHe1oUKDBBQM/h9DMbXYisXDR8iZn38Xrq	member	active	\N	\N	t	2026-03-01 03:00:06.324672	2026-03-01 03:07:59.963372
250	halawany@gmail.com	$2b$10$XTXfBZJDFY/5XIVdmuKXruQcCvrW1scymqpzCwq4TJDeVcT14wmgq	member	active	\N	\N	t	2026-03-01 11:59:58.20194	2026-03-01 12:09:29.689249
251	samka@gmail.com	$2b$10$U1KlEvb0P2HkaOrqUxuCBuNgn6x4JHLfYiKbK5LR7YGZq2hRQqTtK	member	active	\N	\N	t	2026-03-01 18:03:55.006475	2026-03-01 18:06:04.14947
252	just@gmail.com	$2b$10$Q9Xs1rc7HrW5V9XXjgSgWufcKMY4jMS7E1M1Ry99c4ezZ.uKwHTt2	member	pending	\N	\N	t	2026-03-01 18:42:50.565518	2026-03-01 18:42:50.565518
253	qq1@gmail.com	$2b$10$GBRe6WmTi5ye41xQD1sSH.hOhF9GJzXAXQwEiLEezUaZUOay56VRe	team_member	pending	\N	\N	t	2026-03-01 19:24:22.418927	2026-03-01 19:24:22.418927
254	OO@gmail.com	$2b$10$OgzOcf44tKc1OLKRMLzaJOkoiLZXdTrtTni8qHPGqozvzxli/P7m2	team_member	pending	\N	\N	t	2026-03-01 19:38:29.433535	2026-03-01 19:38:29.433535
255	ii@gmail.com	$2b$10$3Stv31Mjv8QL3YByWImheerjHWJ2aV7PMLq5iQC9Z11wW8nvg0ND6	member	pending	\N	\N	t	2026-03-01 19:50:42.887741	2026-03-01 19:50:42.887741
256	kk@gmail.com	$2b$10$VWMDwG09soty7yhmjkDhUeKK0MU6Qax1T8kbXM3pPusu5f1EbU4GS	team_member	active	\N	\N	t	2026-03-01 20:01:33.324408	2026-03-01 21:14:07.683599
\.


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activity_logs (id, member_id, action, description, action_date) FROM stdin;
1	15	team_member_registered	Submitted detailed information for team member	2026-01-27 18:14:31.703
2	14	team_member_registered	Submitted detailed information for team member	2026-01-27 18:14:54.61
3	14	team_member_teams_selected	Selected 3 team(s): Al-Ahly, Zamalek, Ismaily	2026-01-27 18:51:04.104
4	15	team_member_teams_selected	Selected 1 team(s): Al-Ahly	2026-01-27 18:51:35.301
5	16	team_member_registered	Submitted detailed information for team member	2026-01-28 17:44:16.657
6	16	team_member_teams_selected	Selected 2 team(s): Al-Ahly, Zamalek	2026-01-28 17:44:30.786
7	17	team_member_registered	Submitted detailed information for team member	2026-01-28 19:19:33.84
8	17	team_member_teams_selected	Selected 2 team(s): Al-Ahly, Zamalek	2026-01-28 19:20:01.843
9	19	detailed_info_submitted	Submitted detailed information for student member	2026-01-30 19:09:39.819
10	22	detailed_info_submitted	Submitted detailed information for student member	2026-01-30 20:45:07.231
11	24	detailed_info_submitted	Submitted detailed information for student member	2026-01-31 22:42:01.277
12	25	detailed_info_submitted	Submitted detailed information for student member	2026-02-01 04:09:54.802
13	26	detailed_info_submitted	Submitted detailed information for working member	2026-02-01 04:13:54.34
14	27	detailed_info_submitted	Submitted detailed information for working member	2026-02-01 04:27:15.563
15	\N	api_request	GET /api/memberships 304 success (501ms)	2026-02-06 17:30:41.263
16	\N	api_request	GET /api/memberships 304 success (1289ms)	2026-02-06 17:30:42.559
17	\N	api_request	POST /api/register/basic 201 success (2046ms)	2026-02-06 18:18:46.552
18	28	api_request	POST /api/register/determine-membership 200 success (2ms)	2026-02-06 18:18:46.564
19	28	team_member_details_submitted	Submitted team member details	2026-02-06 18:18:47.963
20	28	api_request	POST /api/register/details/team-member 201 success (1482ms)	2026-02-06 18:18:48.097
21	28	team_member_teams_selected	Selected team member teams	2026-02-06 18:18:48.69
22	28	api_request	POST /api/register/team-member/select-teams 201 success (830ms)	2026-02-06 18:18:48.936
23	28	api_request	POST /api/register/complete 201 success (2ms)	2026-02-06 18:18:48.948
24	\N	api_request	GET /api/memberships 304 success (1205ms)	2026-02-06 18:23:14.881
25	\N	api_request	GET /api/memberships 304 success (1338ms)	2026-02-06 18:23:16.224
26	\N	api_request	POST /api/register/basic 409 failed (1265ms)	2026-02-06 18:26:12.034
27	\N	api_request	POST /api/register/basic 201 success (1749ms)	2026-02-06 18:26:37.576
28	29	api_request	POST /api/register/determine-membership 200 success (1ms)	2026-02-06 18:26:37.588
29	29	api_request	POST /api/register/details/team-member 400 failed (3ms)	2026-02-06 18:26:37.598
30	\N	api_request	POST /api/register/basic 409 failed (1222ms)	2026-02-06 18:27:08.389
31	\N	api_request	POST /api/register/basic 201 success (1771ms)	2026-02-06 18:28:10.212
32	30	api_request	POST /api/register/determine-membership 200 success (2ms)	2026-02-06 18:28:10.226
33	30	team_member_details_submitted	Submitted team member details	2026-02-06 18:28:11.55
34	30	api_request	POST /api/register/details/team-member 201 success (1432ms)	2026-02-06 18:28:11.671
35	30	team_member_teams_selected	Selected team member teams	2026-02-06 18:28:12.183
36	30	api_request	POST /api/register/team-member/select-teams 201 success (625ms)	2026-02-06 18:28:12.304
37	30	api_request	POST /api/register/complete 201 success (1ms)	2026-02-06 18:28:12.313
38	\N	api_request	GET /api/memberships 304 success (1527ms)	2026-02-06 18:30:56.46
39	\N	api_request	GET /api/memberships 200 success (214ms)	2026-02-06 18:30:57.112
40	\N	api_request	GET /api/memberships 304 success (1131ms)	2026-02-06 18:30:58.247
41	\N	api_request	POST /api/register/basic 201 success (2046ms)	2026-02-06 18:31:57.335
42	31	api_request	POST /api/register/determine-membership 200 success (1ms)	2026-02-06 18:31:57.346
43	31	team_member_details_submitted	Submitted team member details	2026-02-06 18:31:58.726
44	31	api_request	POST /api/register/details/team-member 201 success (1476ms)	2026-02-06 18:31:58.837
45	31	team_member_teams_selected	Selected team member teams	2026-02-06 18:31:59.371
46	31	api_request	POST /api/register/team-member/select-teams 201 success (642ms)	2026-02-06 18:31:59.488
47	31	api_request	POST /api/register/complete 201 success (1ms)	2026-02-06 18:31:59.516
48	\N	api_request	GET /api/memberships 304 success (3718ms)	2026-02-06 20:11:33.618
49	\N	api_request	GET /api/memberships 304 success (1018ms)	2026-02-06 20:11:34.638
50	\N	api_request	GET /api/memberships 304 success (1296ms)	2026-02-06 20:12:24.591
51	\N	api_request	GET /api/memberships 304 success (1373ms)	2026-02-06 20:12:25.966
52	\N	api_request	GET /api/register/faculties 304 success (1320ms)	2026-02-06 20:12:40.792
53	\N	api_request	GET /api/register/faculties 304 success (1605ms)	2026-02-06 20:12:42.4
54	\N	api_request	GET /api/memberships 304 success (1245ms)	2026-02-06 20:13:00.744
55	\N	api_request	GET /api/memberships 304 success (943ms)	2026-02-06 20:13:01.689
56	\N	api_request	GET /api/memberships 304 success (1097ms)	2026-02-06 20:17:33.32
57	\N	api_request	GET /api/memberships 304 success (1033ms)	2026-02-06 20:17:34.355
58	\N	api_request	GET /api/register/faculties 304 success (2191ms)	2026-02-06 20:18:03.941
59	\N	api_request	GET /api/register/faculties 304 success (3480ms)	2026-02-06 20:18:07.424
60	\N	api_request	GET /api/register/faculties 304 success (1629ms)	2026-02-07 01:57:55.877
61	\N	api_request	GET /api/register/faculties 304 success (774ms)	2026-02-07 01:57:56.653
62	\N	api_request	GET /api/register/faculties 304 success (946ms)	2026-02-07 01:58:16.395
63	\N	api_request	GET /api/register/faculties 304 success (901ms)	2026-02-07 01:58:17.299
64	\N	api_request	GET /api/register/faculties 304 success (649ms)	2026-02-07 01:58:24.028
65	\N	api_request	GET /api/register/faculties 304 success (93ms)	2026-02-07 01:58:24.128
66	\N	api_request	GET /api/register/faculties 304 success (1871ms)	2026-02-07 17:46:39.542
67	\N	api_request	GET /api/register/faculties 304 success (1048ms)	2026-02-07 17:46:40.595
68	\N	api_request	GET /api/register/faculties 304 success (1437ms)	2026-02-07 17:46:58.733
69	\N	api_request	GET /api/register/faculties 304 success (2307ms)	2026-02-07 17:47:01.044
70	\N	api_request	GET /api/memberships 200 success (2445ms)	2026-02-07 18:17:53.946
71	\N	api_request	GET /api/memberships 304 success (399ms)	2026-02-07 18:17:54.691
72	\N	api_request	GET /api/memberships 304 success (10044ms)	2026-02-07 18:18:19.452
73	39	detailed_info_submitted	Submitted detailed information for student member	2026-02-14 14:58:57.822
74	40	detailed_info_submitted	Submitted detailed information for student member	2026-02-14 15:00:06.257
75	41	detailed_info_submitted	Submitted detailed information for student member	2026-02-14 15:06:51.427
76	42	detailed_info_submitted	Submitted detailed information for student member	2026-02-14 15:17:18.833
77	43	detailed_info_submitted	Submitted detailed information for student member	2026-02-14 15:22:02.597
78	44	detailed_info_submitted	Submitted detailed information for student member	2026-02-14 15:24:50.841
79	46	detailed_info_submitted	Submitted detailed information for working member	2026-02-15 01:33:09.587
80	\N	api_request	GET /api/memberships 304 success (741ms)	2026-02-15 01:43:01.023
81	\N	api_request	GET /api/memberships 304 success (708ms)	2026-02-15 01:43:01.74
82	\N	api_request	GET /api/memberships 304 success (254ms)	2026-02-15 01:56:24.662
83	\N	api_request	GET /api/memberships 304 success (654ms)	2026-02-15 01:56:25.326
84	48	detailed_info_submitted	Submitted detailed information for working member	2026-02-15 02:20:09.776
85	50	detailed_info_submitted	Submitted detailed information for working member	2026-02-15 02:25:18.231
86	53	detailed_info_submitted	Submitted detailed information for working member	2026-02-17 03:05:04.663
87	57	detailed_info_submitted	Submitted detailed information for working member	2026-02-17 18:24:57.178
88	63	detailed_info_submitted	Submitted detailed information for student member	2026-02-17 22:20:07.835
89	68	detailed_info_submitted	Submitted detailed information for retired member	2026-02-17 23:05:13.295
90	69	detailed_info_submitted	Submitted detailed information for VISITOR membership	2026-02-17 23:07:50.341
91	71	seasonal_foreigner_info_submitted	Submitted detailed information for seasonal-foreigner membership (1 months)	2026-02-18 01:24:06.678
92	78	team_member_details_submitted	Team member details and documents submitted	2026-02-17 23:47:32.859648
93	78	team_member_teams_selected	Selected teams: Football, Swimming	2026-02-17 23:47:33.995691
94	81	detailed_info_submitted	Submitted detailed information for working member	2026-02-18 13:09:04.802
95	82	team_member_details_submitted	Team member details and documents submitted	2026-02-19 08:30:03.516823
96	82	team_member_teams_selected	Selected teams: Basketball, FootBall, Scorore, Swim	2026-02-19 08:30:04.130778
97	83	team_member_details_submitted	Team member details and documents submitted	2026-02-19 10:52:34.206765
98	83	team_member_teams_selected	Selected teams: FootBall, Basketball, Swimming	2026-02-19 10:52:34.870833
99	84	team_member_details_submitted	Team member details and documents submitted	2026-02-19 11:10:45.98878
100	84	team_member_teams_selected	Selected teams: Swimming, FootBall	2026-02-19 11:10:46.587229
101	85	team_member_details_submitted	Team member details and documents submitted	2026-02-19 11:17:28.703921
102	85	team_member_teams_selected	Selected teams: Swimming, Basketball	2026-02-19 11:17:29.34472
103	86	team_member_details_submitted	Team member details and documents submitted	2026-02-19 11:28:52.345365
104	86	team_member_teams_selected	Selected teams: Swimming	2026-02-19 11:28:53.14203
105	87	team_member_details_submitted	Team member details and documents submitted	2026-02-19 11:41:45.965821
106	87	team_member_teams_selected	Selected teams: Swimming	2026-02-19 11:41:46.564469
107	88	team_member_details_submitted	Team member details and documents submitted	2026-02-19 11:52:46.214559
108	88	team_member_teams_selected	Selected teams: Swimming, Basketball	2026-02-19 11:52:46.968964
109	89	team_member_details_submitted	Team member details and documents submitted	2026-02-19 12:08:22.736355
110	89	team_member_teams_selected	Selected teams: Swimming	2026-02-19 12:08:23.811831
111	90	detailed_info_submitted	Submitted detailed information for working member	2026-02-20 17:00:20.165
112	91	detailed_info_submitted	Submitted detailed information for working member	2026-02-20 17:02:17.998
113	92	team_member_details_submitted	Team member details and documents submitted	2026-02-20 15:04:49.933736
114	92	team_member_teams_selected	Selected teams: Swim, Swimming	2026-02-20 15:04:51.147439
115	93	team_member_details_submitted	Team member details and documents submitted	2026-02-20 18:13:17.44435
116	93	team_member_teams_selected	Selected teams: Scorore, Basketball	2026-02-20 18:13:18.725716
117	94	detailed_info_submitted	Submitted detailed information for working member	2026-02-20 20:30:35.555
118	95	team_member_details_submitted	Team member details and documents submitted	2026-02-20 21:29:12.899405
119	95	team_member_teams_selected	Selected teams: Swim, Swimming, FootBall, Basketball	2026-02-20 21:29:13.55559
120	89	profile_updated	Member updated their profile information	2026-02-20 23:05:09.155774
121	89	profile_updated	Member updated their profile information	2026-02-20 23:13:43.584048
122	89	profile_updated	Member updated their profile information	2026-02-20 23:18:17.034128
123	89	team_member_teams_selected	Selected teams: كوره اجنبيه	2026-02-20 23:22:51.573042
124	89	team_member_teams_selected	Selected teams: سلة	2026-02-20 23:30:17.901846
125	97	team_member_details_submitted	Team member details and documents submitted	2026-02-21 09:54:47.186319
126	98	team_member_details_submitted	Team member details and documents submitted	2026-02-21 09:57:17.99377
127	99	team_member_details_submitted	Team member details and documents submitted	2026-02-21 10:01:41.18276
128	100	team_member_details_submitted	Team member details and documents submitted	2026-02-21 10:05:12.275897
129	100	team_member_teams_selected	Selected teams: FootBall	2026-02-21 10:05:13.488762
130	102	detailed_info_submitted	Submitted detailed information for student member	2026-02-21 17:40:11.378
131	103	detailed_info_submitted	Submitted detailed information for VISITOR membership	2026-02-21 20:04:12.081
132	104	detailed_info_submitted	Submitted detailed information for working member	2026-02-21 20:12:59.782
133	106	detailed_info_submitted	Submitted detailed information for student member	2026-02-21 20:23:39.109
134	107	detailed_info_submitted	Submitted detailed information for working member	2026-02-21 20:30:03.494
135	108	detailed_info_submitted	Submitted detailed information for working member	2026-02-21 20:36:16.907
136	109	detailed_info_submitted	Submitted detailed information for working member	2026-02-21 20:45:09.982
137	110	detailed_info_submitted	Submitted detailed information for working member	2026-02-21 20:54:30.03
138	111	detailed_info_submitted	Submitted detailed information for working member	2026-02-21 21:25:42.67
139	112	detailed_info_submitted	Submitted detailed information for student member	2026-02-21 21:37:29.258
140	113	detailed_info_submitted	Submitted detailed information for student member	2026-02-21 21:53:16.518
141	114	detailed_info_submitted	Submitted detailed information for retired member	2026-02-21 21:56:49.692
142	118	seasonal_foreigner_info_submitted	Submitted detailed information for seasonal-foreigner membership (1 months)	2026-02-21 22:21:21.664
143	119	detailed_info_submitted	Submitted detailed information for VISITOR membership	2026-02-21 22:23:41.356
144	120	detailed_info_submitted	Submitted detailed information for retired member	2026-02-21 22:31:52.479
145	121	detailed_info_submitted	Submitted detailed information for retired member	2026-02-21 22:36:23.218
146	122	detailed_info_submitted	Submitted detailed information for retired member	2026-02-21 22:42:24.147
147	123	detailed_info_submitted	Submitted detailed information for retired member	2026-02-21 22:52:31.954
148	124	detailed_info_submitted	Submitted detailed information for student member	2026-02-21 22:55:54.335
149	125	detailed_info_submitted	Submitted detailed information for VISITOR membership	2026-02-21 22:56:17.196
150	126	detailed_info_submitted	Submitted detailed information for VISITOR membership	2026-02-21 23:00:38.094
151	128	detailed_info_submitted	Submitted detailed information for student member	2026-02-21 23:04:40.141
152	129	detailed_info_submitted	Submitted detailed information for VISITOR membership	2026-02-21 23:12:39.291
153	130	detailed_info_submitted	Submitted detailed information for student member	2026-02-21 23:16:20.119
154	131	detailed_info_submitted	Submitted detailed information for VISITOR membership	2026-02-21 23:31:18.789
155	132	detailed_info_submitted	Submitted detailed information for working member	2026-02-21 23:32:58.4
156	133	detailed_info_submitted	Submitted detailed information for VISITOR membership	2026-02-21 23:38:48.854
157	134	detailed_info_submitted	Submitted detailed information for working member	2026-02-21 23:42:03.02
158	136	detailed_info_submitted	Submitted detailed information for retired member	2026-02-22 00:41:19.418
159	137	detailed_info_submitted	Submitted detailed information for student member	2026-02-22 00:43:42.686
160	144	seasonal_foreigner_info_submitted	Submitted detailed information for seasonal-foreigner membership (6 months)	2026-02-22 01:35:58.542
161	145	detailed_info_submitted	Submitted detailed information for VISITOR membership	2026-02-22 01:42:18.943
162	146	detailed_info_submitted	Submitted detailed information for working member	2026-02-22 06:06:58.491
163	147	detailed_info_submitted	Submitted detailed information for working member	2026-02-22 22:10:53.915
164	148	detailed_info_submitted	Submitted detailed information for working member	2026-02-24 02:50:18.527
165	149	detailed_info_submitted	Submitted detailed information for retired member	2026-02-24 02:53:13.444
166	151	detailed_info_submitted	Submitted detailed information for working member	2026-02-24 14:33:54.143
167	153	detailed_info_submitted	Submitted detailed information for working member	2026-02-24 15:47:03.791
168	154	detailed_info_submitted	Submitted detailed information for working member	2026-02-24 16:47:14.293
169	155	detailed_info_submitted	Submitted detailed information for student member	2026-02-24 16:46:48.358
170	156	detailed_info_submitted	Submitted detailed information for student member	2026-02-24 20:44:09.458
171	157	seasonal_foreigner_info_submitted	Submitted detailed information for seasonal-foreigner membership (1 months)	2026-02-24 21:26:12.2
172	158	detailed_info_submitted	Submitted detailed information for working member	2026-02-25 01:18:01.648
173	159	detailed_info_submitted	Submitted detailed information for working member	2026-02-25 04:29:03.712
174	160	detailed_info_submitted	Submitted detailed information for working member	2026-02-25 06:28:03.059
175	161	detailed_info_submitted	Submitted detailed information for student member	2026-03-01 05:04:06.623
176	163	detailed_info_submitted	Submitted detailed information for student member	2026-03-01 14:02:10.639
177	164	detailed_info_submitted	Submitted detailed information for student member	2026-03-01 20:06:43.054
178	165	detailed_info_submitted	Submitted detailed information for student member	2026-03-01 20:45:27.654
179	166	detailed_info_submitted	Submitted detailed information for student member	2026-03-01 21:50:53.715
\.


--
-- Data for Name: advertisement_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.advertisement_categories (id, code, name_en, name_ar, is_active, created_at, updated_at, color_code, description_en, description_ar) FROM stdin;
1	PROMOTION	Promotion	عرض ترويجي	t	2026-02-13 20:21:38.048669	2026-02-13 20:21:38.048669	\N	\N	\N
2	EVENT	Event	حدث	t	2026-02-13 20:21:38.048669	2026-02-13 20:21:38.048669	\N	\N	\N
3	ANNOUNCEMENT	Announcement	إعلان	t	2026-02-13 20:21:38.048669	2026-02-13 20:21:38.048669	\N	\N	\N
4	NEWS	News	أخبار	t	2026-02-13 20:21:38.048669	2026-02-13 20:21:38.048669	\N	\N	\N
5	MAINTENANCE	Maintenance	الصيانة	t	2026-02-13 20:21:38.048669	2026-02-13 20:21:38.048669	\N	\N	\N
\.


--
-- Data for Name: advertisement_photos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.advertisement_photos (id, advertisement_id, photo_url, display_order, created_at, original_filename, alt_text_en, alt_text_ar) FROM stdin;
1	2	uploads\\photos-1771030858963-170155452.png	1	2026-02-14 01:01:00.744283	Screenshot 2024-03-24 030734.png		
\.


--
-- Data for Name: advertisements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.advertisements (id, description_en, description_ar, category_id, created_by, approved_by, approved_at, is_featured, start_date, end_date, view_count, click_count, created_at, updated_at, title_en, title_ar, status, approval_status, approval_notes) FROM stdin;
1	Updated description	وصف محدث	1	11	11	2026-02-14 01:59:00.682	f	2026-06-15	2026-09-15	0	0	2026-02-13 23:56:38.932216	2026-02-13 23:59:43.89941	Updated Title	عنوان محدث	published	approved	Looks great! Approved for publishing.
2	offers	عروض 	2	11	\N	\N	t	2026-06-01	2026-08-31	0	0	2026-02-14 01:01:00.431652	2026-02-14 01:01:00.431652	ad1	عرض1	pending	pending	\N
\.


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.announcements (id, sport_id, branch_id, created_by_staff_id, title_en, title_ar, description_en, description_ar, banner_image, thumbnail_image, external_link, status, is_visible, priority, published_at, expires_at, view_count, click_count, subscription_count, target_role, min_age, max_age, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, "userName", role, action, module, description, status, "ipAddress", "oldValue", "newValue", "dateTime") FROM stdin;
712a4e46-80e8-4eba-9cb9-65d5fbf79259	Admin User	Admin	Create	Sports	Created sport: Swimming (Swimming)	نجح	0.0.0.0	\N	{"id": 6, "price": 12345, "status": "active", "name_ar": "Swimming", "name_en": "Swimming", "is_active": true, "created_at": "2026-02-15T20:56:34.678Z", "updated_at": "2026-02-15T20:56:34.678Z", "approved_at": "2026-02-15T22:56:34.047Z", "sport_image": null, "description_ar": null, "description_en": null, "max_participants": 0, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	2026-02-16 00:56:34.275
74b1be29-f50a-4822-97c6-b29f29bd5fa2	Admin User	Admin	Delete	Sports	Deleted sport: swimming 2 (سباحة 2)	نجح	0.0.0.0	{"price": "105.00", "status": "active", "name_ar": "سباحة 2", "name_en": "swimming 2", "is_active": true, "created_at": "2026-02-14T07:33:47.690Z", "updated_at": "2026-02-14T21:22:33.492Z", "approved_at": "2026-02-14T09:33:40.954Z", "sport_image": null, "description_ar": null, "description_en": null, "max_participants": 0, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	\N	2026-02-16 01:08:47.594
0c8c35a1-1734-4d42-afbb-674627f43143	Admin User	admin	Register	Staff	Registered new staff member: Zed Alaa	نجح	::1	\N	{"email": "staff.01244567891344@helwan-club.local", "message": "Staff member registered successfully", "success": true, "staff_id": 19, "account_id": 74}	2026-02-16 01:39:08.348
47468a6a-4b69-44d4-b5f4-087494cb625f	Admin User	admin	Assign Packages	Staff	Assigned privilege packages to staff ID: 19	نجح	::1	\N	{"package_ids": [5]}	2026-02-16 01:39:09.503
1afdb84f-4ca4-468b-9ab7-7b6bb4f018d6	Media Specialist	Media Specialist	Login	Auth	User logged in: Media Specialist	نجح	::1	\N	\N	2026-02-16 09:54:35.51
6f1da922-7e33-43fe-aad7-c7ab60a90372	Media Specialist	Media Specialist	Login	Auth	User logged in: Media Specialist	نجح	::1	\N	\N	2026-02-16 09:55:22.355
cb52c720-8f90-4927-8a1a-a96ef130f8cf	Media Specialist	Media Specialist	Login	Auth	User logged in: Media Specialist	نجح	::1	\N	\N	2026-02-16 09:56:23.244
fcc58140-c3f3-41c9-91a5-be14d845a499	Media Specialist	Media Specialist	Login	Auth	User logged in: Media Specialist	نجح	::1	\N	\N	2026-02-16 10:11:42.156
0c453e26-86bf-48f8-b610-2b7e60792c6b	Media Specialist	Media Specialist	Create	MediaGallery	Created media post: New Team	نجح	::1	\N	{"id": 1, "date": "2026-02-16T09:02:08.182Z", "title": "New Team", "images": ["/uploads/images-1771232528178-347868792.jpg"], "category": "صور", "videoUrl": "", "created_at": "2026-02-16T07:02:09.860Z", "updated_at": "2026-02-16T07:02:09.860Z", "description": "New Team 11 Member From Must Good Members", "videoDuration": null}	2026-02-16 11:02:09.219
01d87b74-094f-43c1-94be-7a2fbe437bc0	Media Specialist	Media Specialist	Create	MediaGallery	Created media post: new	نجح	::1	\N	{"id": 2, "date": "2026-02-16T09:02:58.296Z", "title": "new", "images": ["/uploads/images-1771232578280-887378254.jpeg", "/uploads/images-1771232578292-811968382.jpeg"], "category": "صور", "videoUrl": "", "created_at": "2026-02-16T07:03:00.084Z", "updated_at": "2026-02-16T07:03:00.084Z", "description": "New New", "videoDuration": null}	2026-02-16 11:02:59.428
c41b1457-172f-4c35-b0a8-9600517e745a	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-16 11:43:32.665
f0ef9e71-b910-4ec1-a613-20ee1220b11f	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-16 11:43:55.599
41a55568-4e63-42e3-9e55-4befb9c0a9ba	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-16 11:44:43.979
f67eedda-449d-4658-8ac8-fe1f4b7170cd	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-16 11:55:53.504
57ad89b3-bec4-472b-abd5-1586e9a2b0f1	Media Specialist	Media Specialist	Login	Auth	User logged in: Media Specialist	نجح	::1	\N	\N	2026-02-16 11:56:46.673
2ad9a97b-c644-41cf-b078-a353bb07f623	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-16 12:25:11.716
40368adc-8dcb-4023-a40c-e2deb10293df	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-16 12:29:55.317
2e073f31-3b38-4a38-8e77-99251eb329e1	Media Specialist	Media Specialist	Login	Auth	User logged in: Media Specialist	نجح	::1	\N	\N	2026-02-16 12:30:14.259
a2bfe9ce-d7ed-415c-840d-0ce59087e31d	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-16 13:27:36.672
0b22aece-c1cc-4a67-b2bf-0cdb4af3279d	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-16 13:39:13.256
df5b289b-c083-4db7-87e2-9bb1ea5ccabb	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-16 15:52:35.78
566610a3-ba9e-4f2e-b154-9f0645e8d169	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-16 20:12:52.733
3c5ba3e8-ed2c-48aa-867a-9b623ffd2dc9	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-16 20:15:08.012
5c72c155-a671-49e5-ad2b-385a430d331b	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-16 20:18:14.853
7e9ff831-9c99-4ba6-a6ac-3ff39259fa7d	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-16 20:18:22.498
606ba188-ea8a-483a-838f-98ec00330390	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-16 20:18:36.873
122782e0-09e8-496a-95e0-5b2ea5ffa9f1	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-16 20:21:44.325
d388252e-3c3c-4041-8c9c-99b7adacba7f	Media Specialist	Media Specialist	Login	Auth	User logged in: Media Specialist	نجح	::1	\N	\N	2026-02-16 20:22:52.281
af1157ba-bc50-4829-8ca2-0490bb3307b1	Media Specialist	Media Specialist	Change Credentials	Auth	User changed credentials: Media Specialist	نجح	::1	\N	\N	2026-02-16 20:23:35.803
f1ed967f-e4e9-4a6c-b72f-570177db817f	Media Specialist	Media Specialist	Login	Auth	User logged in: Media Specialist	نجح	::1	\N	\N	2026-02-16 20:23:56.001
58f0d38e-c509-468b-b296-a3a63e51aad4	Media Specialist	Media Specialist	Login	Auth	User logged in: Media Specialist	نجح	::1	\N	\N	2026-02-16 21:22:16.371
6d58bb4b-24d3-4f4e-ba19-cc6c2281a8f3	Media Specialist	Media Specialist	Login	Auth	User logged in: Media Specialist	نجح	::1	\N	\N	2026-02-16 21:22:31.363
2d45afca-6572-4fe2-96ce-fb1fbb07118a	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-16 21:22:47.945
b3509b87-1755-41b3-a468-a0c73d945554	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-16 21:24:16.082
9ade3370-b189-4b26-8e4a-61aeeaf30f15	Media Specialist	Media Specialist	Login	Auth	User logged in: Media Specialist	نجح	::1	\N	\N	2026-02-16 21:24:59.661
94e2a788-4a45-4fab-8d51-5b48a3486063	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-16 21:28:07.455
edc348ba-7dc7-42fa-9a3f-90686809219c	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-16 21:40:28.201
f75a4c06-e7a3-4311-b586-36060e5ac5eb	Admin User	Admin	Create	Sports	Created sport: Swim (Swim)	نجح	0.0.0.0	\N	{"id": 7, "price": 1230, "status": "active", "name_ar": "Swim", "name_en": "Swim", "is_active": true, "created_at": "2026-02-16T17:42:41.429Z", "updated_at": "2026-02-16T17:42:41.429Z", "approved_at": "2026-02-16T19:42:40.416Z", "sport_image": null, "description_ar": null, "description_en": null, "max_participants": 0, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	2026-02-16 21:42:40.748
9110033e-7f78-424f-90ba-2432118bd2d8	Yarab Working	Social Activity Manager	Login	Auth	User logged in: Yarab Working	نجح	::1	\N	\N	2026-02-17 19:24:27.22
b49d7a8c-b090-4221-80b9-691761aaf40d	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-17 19:25:13.208
a622900a-f8c7-4f0e-aa49-ebe305b2910c	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-17 19:29:52.272
ab40892a-af81-490a-ac14-86d000369216	admin@club.com	admin	Create	MembershipPlans	Created membership plan: VIP Zed (Zed)	نجح	::1	\N	{"id": 111, "price": 10000, "max_age": null, "min_age": null, "name_ar": "VIP Zed", "name_en": "VIP Zed", "currency": "EGP", "is_active": true, "plan_code": "Zed", "created_at": "2026-02-16T17:44:18.919Z", "updated_at": "2026-02-16T17:44:18.919Z", "renewal_price": 7500, "description_ar": null, "description_en": null, "is_installable": false, "member_type_id": 13, "duration_months": 1, "is_for_foreigner": false, "max_installments": null}	2026-02-16 21:44:18.177
3ed31789-89a5-43d4-92a1-4413f34dcda0	Admin User	admin	Update	Staff	Updated staff member ID: 1	نجح	::1	\N	{"phone": "0123456789", "first_name_en": "Admin"}	2026-02-16 21:49:32.641
f2df8347-9429-4c32-b165-bf2926080648	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-17 02:47:18.927
5bf521a2-6387-4d58-8e9f-3de0edd70a00	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-17 14:46:36.36
5daf9dbe-7b6e-40c3-9a43-538e47c111ca	Admin User	Admin	Create	Sports	Created sport: Scorore (كوره اجنبيه)	نجح	0.0.0.0	\N	{"id": 8, "price": 5000, "status": "active", "name_ar": "كوره اجنبيه", "name_en": "Scorore", "is_active": true, "created_at": "2026-02-17T10:48:32.205Z", "updated_at": "2026-02-17T10:48:32.205Z", "approved_at": "2026-02-17T12:48:31.484Z", "sport_image": null, "description_ar": null, "description_en": null, "max_participants": 0, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	2026-02-17 14:48:31.829
cc1b815e-7c25-4f39-995a-2239a3eb8429	Admin User	Admin	Update	Sports	Updated sport: Scorore	نجح	0.0.0.0	{"id": 8, "price": "5000.00", "status": "active", "name_ar": "كوره اجنبيه", "name_en": "Scorore", "is_active": true, "created_at": "2026-02-17T10:48:32.205Z", "updated_at": "2026-02-17T10:48:32.205Z", "approved_at": "2026-02-17T12:48:31.484Z", "sport_image": null, "description_ar": null, "description_en": null, "max_participants": 0, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	{"id": 8, "price": 3000, "status": "active", "name_ar": "كوره اجنبيه", "name_en": "Scorore", "is_active": true, "created_at": "2026-02-17T10:48:32.205Z", "updated_at": "2026-02-17T10:49:34.228Z", "approved_at": "2026-02-17T12:48:31.484Z", "sport_image": null, "description_ar": null, "description_en": null, "max_participants": 0, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	2026-02-17 14:49:34.87
f82d77bd-49b3-4313-8f79-6b32ff05b824	Admin User	Admin	Approve	Members	Approved membership request for: momo momo	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-17 15:03:05.368
1f442954-a8ec-4f82-84ee-eecc06c4e6ca	Admin User	Admin	Approve	Members	Approved membership request for: momo momo	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-17 15:03:05.611
4c787220-6eaa-4bb9-9eb8-7bafa0ec993d	Admin User	Admin	Approve	Members	Approved membership request for: momo momo	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-17 15:03:07.328
a93294bb-672f-4de3-8d27-5a03cbd6b14b	Admin User	Admin	Approve	Members	Approved membership request for: momo momo	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-17 15:03:07.715
1e991608-8e89-49b7-b36e-8cd4a37c2fcc	Admin User	Admin	Approve	Members	Approved membership request for: momo mo	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-17 15:03:17.226
3a672898-3b31-4aae-8ff4-6527b2694c97	Mohammed Heshsaam	Founder Member	Login	Auth	User logged in: Mohammed Heshsaam	نجح	::1	\N	\N	2026-02-17 15:06:29.04
6ffe550a-6415-4b47-9c3f-e81d75cde9d2	Mohammed Heshsaam	Founder Member	Change Credentials	Auth	User changed credentials: Mohammed Heshsaam	نجح	::1	\N	\N	2026-02-17 15:06:43.05
08eb016a-0b34-4d1c-9cf8-e975e40ca5e7	Mohammed Heshsaam	Founder Member	Login	Auth	User logged in: Mohammed Heshsaam	نجح	::1	\N	\N	2026-02-17 15:06:55.213
f88edea7-64f6-4476-93e4-6d24a47a483f	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-17 15:54:00.466
1f4664b2-5004-45f1-ac81-f8ef526153f9	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-17 15:54:09.799
07ec4d39-4116-4a6f-8edb-e35410e47bc6	Admin User	admin	Register	Staff	Registered new staff member: tester tototot	نجح	::1	\N	{"email": "staff.15619830651616@helwan-club.local", "message": "Staff member registered successfully", "success": true, "staff_id": 21, "account_id": 83}	2026-02-17 16:04:12.795
3fcfffc3-e916-463e-a5c7-4f7393de9856	Admin User	admin	Assign Packages	Staff	Assigned privilege packages to staff ID: 21	نجح	::1	\N	{"package_ids": [1]}	2026-02-17 16:04:14.494
a2ea20a0-eb50-40db-a22f-3388807756e4	Admin User	Admin	Approve	Members	Approved membership request for: mawopdmoapwd poawmdpoawmd	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-17 17:50:02.988
3e8a6b7b-833a-4eed-97ba-b2ad5ae1e813	Admin User	admin	Register	Staff	Registered new staff member: Mobamba Lamba	نجح	::1	\N	{"email": "staff.11111111111111@helwan-club.local", "message": "Staff member registered successfully", "success": true, "staff_id": 22, "account_id": 84}	2026-02-17 18:09:35.165
041e9eba-344a-443e-ad61-6d842807fe23	Mobamba Lamba	Executive Secretariat Manager	Login	Auth	User logged in: Mobamba Lamba	نجح	::1	\N	\N	2026-02-17 18:33:39.155
19071d49-d946-48dd-a08e-eba378632b45	Mobamba Lamba	Executive Secretariat Manager	Login	Auth	User logged in: Mobamba Lamba	نجح	::1	\N	\N	2026-02-17 18:33:54.076
dd85ab36-8c45-436d-81d5-1c73d9adde1e	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-17 18:34:18.047
f5b32597-f6d9-4e20-a995-7502629c8652	Mobamba Lamba	Executive Secretariat Manager	Login	Auth	User logged in: Mobamba Lamba	نجح	::1	\N	\N	2026-02-17 18:41:58.903
d1a177fd-53b4-44cf-9e98-55c8f8fb4a23	Mobamba Lamba	Executive Secretariat Manager	Login	Auth	User logged in: Mobamba Lamba	نجح	::1	\N	\N	2026-02-17 18:43:12.579
a7d13a16-7af8-4bfd-8d6f-58e9e2c1ef61	Mobamba Lamba	Executive Secretariat Manager	Login	Auth	User logged in: Mobamba Lamba	نجح	::1	\N	\N	2026-02-17 18:43:31.685
7fd75010-6fa6-4ba4-aa4e-eba62d964d8b	Mobamba Lamba	Executive Secretariat Manager	Login	Auth	User logged in: Mobamba Lamba	نجح	::1	\N	\N	2026-02-17 18:44:49.171
3017d681-9690-4508-a662-12fe0eff15b8	Mobamba Lamba	Executive Secretariat Manager	Login	Auth	User logged in: Mobamba Lamba	نجح	::1	\N	\N	2026-02-17 18:47:17.178
f48b0704-2afa-4146-8335-cd4f44b51e4e	Mobamba Lamba	Executive Secretariat Manager	Login	Auth	User logged in: Mobamba Lamba	نجح	::1	\N	\N	2026-02-17 18:47:37.671
69e4d879-c769-4f58-99e5-ef0e7a0434b9	Mobamba Lamba	Executive Secretariat Manager	Login	Auth	User logged in: Mobamba Lamba	نجح	::1	\N	\N	2026-02-17 18:51:13.32
20561aaa-ba5a-4342-a8a6-7e507052755c	Mobamba Lamba	Executive Secretariat Manager	Login	Auth	User logged in: Mobamba Lamba	نجح	::1	\N	\N	2026-02-17 19:13:18.223
ff65bbf0-930f-43df-a03b-12fc90f5214f	Mobamba Lamba	Executive Secretariat Manager	Login	Auth	User logged in: Mobamba Lamba	نجح	::1	\N	\N	2026-02-17 19:13:34.813
5d750a67-af32-40ba-9caf-d3a6f75f90e7	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-17 19:16:28.959
4e5ec1b9-3a92-4683-be24-baec9d9e3d3c	Admin User	Admin	Change Credentials	Auth	User changed credentials: Admin User	نجح	::1	\N	\N	2026-02-17 19:17:14.671
f77fbe20-93cc-44dd-8367-392a9e423f5c	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-17 19:23:23.712
518c594d-cf77-44ab-842a-7d658828e527	Admin User	admin	Register	Staff	Registered new staff member: Yarab Working	نجح	::1	\N	{"email": "staff.11111111111112@helwan-club.local", "message": "Staff member registered successfully", "success": true, "staff_id": 23, "account_id": 91}	2026-02-17 19:24:14.128
4e4fe9d3-e867-4428-88ec-956b2928bff4	Admin User	admin	Register	Staff	Registered new staff member: MoMo MOMOPM	نجح	::1	\N	{"email": "staff.13333333333333@helwan-club.local", "message": "Staff member registered successfully", "success": true, "staff_id": 24, "account_id": 92}	2026-02-17 19:30:47.211
2126474a-f9b6-4f32-ada1-467c7e0985c2	MoMo MOMOPM	Sports Activity Specialist	Login	Auth	User logged in: MoMo MOMOPM	نجح	::1	\N	\N	2026-02-17 19:30:59.256
b5e3e101-558e-4f60-8efc-b0ce3c2bf194	MoMo MOMOPM	Sports Activity Specialist	Login	Auth	User logged in: MoMo MOMOPM	نجح	::1	\N	\N	2026-02-17 19:31:44.347
7a715509-cd34-4853-8bb8-ac95c715101c	MoMo MOMOPM	Sports Activity Specialist	Login	Auth	User logged in: MoMo MOMOPM	نجح	::1	\N	\N	2026-02-17 19:32:09.88
3efa2837-4af9-4eb1-be2a-6e32c6123d7d	MoMo MOMOPM	Sports Activity Specialist	Login	Auth	User logged in: MoMo MOMOPM	نجح	::1	\N	\N	2026-02-17 19:33:59.57
3ce1d971-87fc-4648-8799-8c30bf2b0437	MoMo MOMOPM	Sports Activity Specialist	Login	Auth	User logged in: MoMo MOMOPM	نجح	::1	\N	\N	2026-02-17 19:36:07.879
7274dd01-d647-46d5-8277-fe4b8d8493c6	MoMo MOMOPM	Sports Activity Specialist	Change Credentials	Auth	User changed credentials: MoMo MOMOPM	نجح	::1	\N	\N	2026-02-17 19:36:41.729
f438dc6b-27ea-4dba-80bc-57bcf1048328	MoMo MOMOPM	Sports Activity Specialist	Login	Auth	User logged in: MoMo MOMOPM	نجح	::1	\N	\N	2026-02-17 19:37:41.989
2617a148-9dd7-4328-8d8f-a7606cd5e0bc	MoMo MOMOPM	Sports Activity Specialist	Login	Auth	User logged in: MoMo MOMOPM	نجح	::1	\N	\N	2026-02-17 19:40:22.732
17e3267f-5b48-4d9a-a5b3-7fe99ff438db	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-17 19:41:22.842
edb39e0a-aaf7-4ae5-8b40-da68506bd655	MoMo MOMOPM	Sports Activity Specialist	Login	Auth	User logged in: MoMo MOMOPM	نجح	::1	\N	\N	2026-02-17 20:03:05.529
eb81b62e-52a5-4447-9e26-f3f38b2ccfac	MoMo MOMOPM	Sports Activity Specialist	Login	Auth	User logged in: MoMo MOMOPM	نجح	::1	\N	\N	2026-02-17 20:10:59.758
1f1fc7f8-247f-46d7-9abe-3b51e760a173	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-17 20:11:24.185
a1c95352-3562-4bf3-905e-7f15121329fd	Admin User	admin	Assign Packages	Staff	Assigned privilege packages to staff ID: 24	نجح	::1	\N	{"package_ids": [1]}	2026-02-17 20:12:53.799
8c668e0a-388f-4314-9df8-357fdaf263bd	Admin User	admin	Grant Privilege	Staff	Granted privileges to staff ID: 24	نجح	::1	\N	{"ids": [34, 38, 39, 41, 37, 35, 43, 42, 45, 44, 40, 33, 36], "reason": "Assigned from assign-privileges page"}	2026-02-17 20:13:12.751
93d4526c-4760-47a0-80d1-d6f8c478e7e1	MoMo MOMOPM	Sports Activity Specialist	Login	Auth	User logged in: MoMo MOMOPM	نجح	::1	\N	\N	2026-02-17 20:13:30.944
75b876e2-6192-4f69-bd16-c06be03808de	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-17 20:19:24.128
92b58241-6333-4c27-95e9-1f101eaa8fc0	Admin User	admin	Assign Packages	Staff	Assigned privilege packages to staff ID: 24	نجح	::1	\N	{"package_ids": [4]}	2026-02-17 20:20:13.091
c25e73b2-ba75-41c7-9307-c99b8e78f9da	MoMo MOMOPM	Sports Activity Specialist	Login	Auth	User logged in: MoMo MOMOPM	نجح	::1	\N	\N	2026-02-17 20:20:39.816
0ad89e94-cf9d-4eda-b8b4-1bf6241997a1	Admin User	admin	Assign Packages	Staff	Assigned privilege packages to staff ID: 24	نجح	::1	\N	{"package_ids": [3, 1]}	2026-02-17 20:36:17.801
9767b28e-f79a-4fc4-847a-7122b863efb4	MoMo MOMOPM	Sports Activity Specialist	Login	Auth	User logged in: MoMo MOMOPM	نجح	::1	\N	\N	2026-02-17 20:36:39.161
dd462fa2-1bed-403e-8c9c-a5280277d78e	MoMo MOMOPM	Sports Activity Specialist	Login	Auth	User logged in: MoMo MOMOPM	نجح	::1	\N	\N	2026-02-17 20:37:23.381
896662de-a2ca-4583-92b0-e0e050e30047	Admin User	admin	Register	Staff	Registered new staff member: Testing  privalgeings	نجح	::1	\N	{"email": "staff.11111111111123@helwan-club.local", "message": "Staff member registered successfully", "success": true, "staff_id": 25, "account_id": 93}	2026-02-17 20:39:33.767
358c6824-8edb-441f-803a-8eb1d32e80f5	Testing  privalgeings	Media Center Manager	Login	Auth	User logged in: Testing  privalgeings	نجح	::1	\N	\N	2026-02-17 20:39:44.809
60a4215a-a04a-4ec3-89b1-f1d91d278f4c	Testing  privalgeings	Media Center Manager	Change Credentials	Auth	User changed credentials: Testing  privalgeings	نجح	::1	\N	\N	2026-02-17 20:39:58.93
0c915ef9-c2e2-45aa-84c9-fb57f3b5722b	Testing  privalgeings	Media Center Manager	Login	Auth	User logged in: Testing  privalgeings	نجح	::1	\N	\N	2026-02-17 20:40:13.71
46be2982-2df3-48c5-b911-9c0c076d5ea5	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-17 23:17:25.4
872086b6-cb79-483f-8b3e-67f33bb9d76a	Media Specialist	Media Specialist	Login	Auth	User logged in: Media Specialist	نجح	::1	\N	\N	2026-02-17 23:20:53.317
6c9bdd7b-4160-40fa-9bae-b4f468351636	Media Specialist	Media Specialist	Login	Auth	User logged in: Media Specialist	نجح	::1	\N	\N	2026-02-17 23:21:19.469
7786a079-2c0a-4388-9b05-df74112e9125	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-17 23:21:29.382
cf847797-2021-44ec-b1b2-510e834b470b	Admin User	Admin	Status Change	Members	Changed status of member Updated to suspended	نجح	::1	{"oldStatus": "suspended"}	{"newStatus": "suspended"}	2026-02-18 00:31:22.283
9b4cb87d-306c-49ff-b84f-7220a24218d4	Admin User	admin	Register	Staff	Registered new staff member: ZZeed Alaa	نجح	::1	\N	{"email": "staff.01234567890123@helwan-club.local", "message": "Staff member registered successfully", "success": true, "staff_id": 26, "account_id": 102}	2026-02-18 00:36:41.848
2971be98-cc69-4d65-ab56-fe7be72eb346	Admin User	admin	Assign Packages	Staff	Assigned privilege packages to staff ID: 26	نجح	::1	\N	{"package_ids": [5]}	2026-02-18 00:36:42.958
d446d21c-7694-4d56-85ef-ef5eb404fd02	ZZeed Alaa	Admin	Login	Auth	User logged in: ZZeed Alaa	نجح	::1	\N	\N	2026-02-18 00:37:10.045
2d31f9c1-2d6e-4005-b1e4-b34652876ba0	ZZeed Alaa	Admin	Change Credentials	Auth	User changed credentials: ZZeed Alaa	نجح	::1	\N	\N	2026-02-18 00:38:08.345
cde7df63-9fda-4ddd-b444-23308a4e3f7c	ZZeed Alaa	Admin	Login	Auth	User logged in: ZZeed Alaa	نجح	::1	\N	\N	2026-02-18 00:38:29.836
58f9988e-4b92-473f-98d6-f3c79cf371ea	ZZeed Alaa	Admin	Status Change	Members	Changed status of member yara to suspended	نجح	::1	{"oldStatus": "suspended"}	{"newStatus": "suspended"}	2026-02-18 00:54:31.633
5ff9db7a-b555-4fd2-bc75-942fee8c2774	Yara Ahmed	Founder Member	Login	Auth	User logged in: Yara Ahmed	نجح	::1	\N	\N	2026-02-18 02:14:06.955
161e528f-03ea-4d8d-8b7a-fa603e6afece	Yara Ahmed	Founder Member	Login	Auth	User logged in: Yara Ahmed	نجح	::1	\N	\N	2026-02-18 02:15:08.389
f9958038-5e32-4cd4-8b8f-99f173698fb2	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-18 02:15:17.998
4902c09a-4211-437a-9f79-7176f84127c8	Admin User	Admin	Create	Sports	Created sport: تتتتت (kkkk)	نجح	0.0.0.0	\N	{"id": 9, "price": 50000, "status": "active", "name_ar": "kkkk", "name_en": "تتتتت", "is_active": true, "created_at": "2026-02-17T22:24:18.618Z", "updated_at": "2026-02-17T22:24:18.618Z", "approved_at": "2026-02-18T00:24:17.406Z", "sport_image": null, "description_ar": null, "description_en": null, "max_participants": 0, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	2026-02-18 02:24:17.683
68c00266-ae78-4435-8794-32949d184432	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-19 15:04:14.021
dbf10dae-74e3-42e2-8305-6fec3d1beebd	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-19 15:08:10.998
e091d1f2-3c47-489a-b2fd-2be50279145b	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-19 17:09:48.201
3a6afef8-737b-4507-b80a-303a7d347332	Admin User	Admin	Delete	Sports	Deleted sport: تتتتت (kkkk)	نجح	0.0.0.0	{"price": "50000.00", "status": "active", "name_ar": "kkkk", "name_en": "تتتتت", "is_active": true, "created_at": "2026-02-17T22:24:18.618Z", "updated_at": "2026-02-17T22:24:18.618Z", "approved_at": "2026-02-18T00:24:17.406Z", "sport_image": null, "description_ar": null, "description_en": null, "max_participants": 0, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	\N	2026-02-18 02:24:32.047
431e6082-7a4d-4dd8-b6e6-1654bf044176	Admin User	Admin	Approve	Members	Approved membership request for: Yara Ahmed	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-18 02:38:56.109
a5cc86f6-4010-42da-a74c-4bb5e06a0b38	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-18 09:43:45.676
924409c5-23a5-42c5-93c2-8e57f205722b	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-18 11:12:21.468
a0d8e867-7959-43cf-8ec4-e0195d378d51	Admin User	Admin	Create	Members	Created member: Zeyad Zeyad	نجح	::1	\N	{"member": {"id": 79, "phone": "01151031404", "photo": null, "gender": "male", "status": "active", "account": {"id": 111, "role": "member", "email": "member99661144557722@temp.com", "status": "active", "password": "$2b$10$P.5jzO2iKTx/Ihu7rVwyleWzGo2yJkBji2dz/9vbIfEZxadLDvM.O", "is_active": true, "created_at": "2026-02-18T07:14:27.885Z", "last_login": null, "updated_at": "2026-02-18T07:14:27.885Z", "password_changed_at": null}, "address": "asdfghjklkjgfdfgh", "birthdate": "2026-02-01T00:00:00.000Z", "account_id": 111, "created_at": "2026-02-18T07:14:27.885Z", "is_foreign": false, "updated_at": "2026-02-18T07:14:27.885Z", "national_id": "99661144557722", "nationality": "Egyptian", "last_name_ar": "Zeyad", "last_name_en": "Zeyad", "first_name_ar": "Zeyad", "first_name_en": "Zeyad", "health_status": null, "medical_report": null, "member_type_id": 1, "points_balance": 0, "national_id_back": null, "national_id_front": null}, "account": {"id": 111, "role": "member", "email": "member99661144557722@temp.com", "status": "active", "password": "$2b$10$P.5jzO2iKTx/Ihu7rVwyleWzGo2yJkBji2dz/9vbIfEZxadLDvM.O", "is_active": true, "created_at": "2026-02-18T07:14:27.885Z", "last_login": null, "updated_at": "2026-02-18T07:14:27.885Z", "password_changed_at": null}}	2026-02-18 11:14:28.618
e0ef98fb-f700-4821-abc9-812fb14a83de	Admin User	Admin	Create	Members	Created member: kkkkkk kkkkkk	نجح	::1	\N	{"member": {"id": 80, "phone": "01151031404", "photo": null, "gender": "female", "status": "active", "account": {"id": 112, "role": "member", "email": "member775533662211@temp.com", "status": "active", "password": "$2b$10$/695d6RLLeCA8fhtVTj8oudgcs4i9l.fQ20ZEF3c/.a4npnOp0cR2", "is_active": true, "created_at": "2026-02-18T07:17:31.959Z", "last_login": null, "updated_at": "2026-02-18T07:17:31.959Z", "password_changed_at": null}, "address": "asdfghjklkjgfdfgh", "birthdate": "2000-02-01T00:00:00.000Z", "account_id": 112, "created_at": "2026-02-18T07:17:31.959Z", "is_foreign": false, "updated_at": "2026-02-18T07:17:31.959Z", "national_id": "775533662211", "nationality": "Egyptian", "last_name_ar": "Jaaaa", "last_name_en": "kkkkkk", "first_name_ar": "Jaaaa", "first_name_en": "kkkkkk", "health_status": null, "medical_report": null, "member_type_id": 1, "points_balance": 0, "national_id_back": null, "national_id_front": null}, "account": {"id": 112, "role": "member", "email": "member775533662211@temp.com", "status": "active", "password": "$2b$10$/695d6RLLeCA8fhtVTj8oudgcs4i9l.fQ20ZEF3c/.a4npnOp0cR2", "is_active": true, "created_at": "2026-02-18T07:17:31.959Z", "last_login": null, "updated_at": "2026-02-18T07:17:31.959Z", "password_changed_at": null}}	2026-02-18 11:17:32.834
d21b2c0f-6b9a-4249-ba4d-cf7246243dff	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-18 12:22:57.767
a06ab4fb-5a7b-4cdf-9411-5f9ad86b3653	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-18 12:26:37.408
fc083b93-2737-46fb-9543-f769d366ba50	Yara Ahmed	Founder Member	Login	Auth	User logged in: Yara Ahmed	نجح	::1	\N	\N	2026-02-18 12:49:31.16
258ca733-a2d5-47c9-ada1-2f9aa19dc2d8	Yara Ahmed	Founder Member	Login	Auth	User logged in: Yara Ahmed	نجح	::1	\N	\N	2026-02-18 12:50:32.713
b39226ce-0794-4ebc-a5d0-34584247c5b5	Yara Ahmed	Founder Member	Login	Auth	User logged in: Yara Ahmed	نجح	::1	\N	\N	2026-02-18 12:59:19.093
f954930e-0d0b-4964-9f78-3bc54f764e24	Yara Ahmed	Founder Member	Login	Auth	User logged in: Yara Ahmed	نجح	::1	\N	\N	2026-02-18 12:59:48.74
c5dd6b6f-818f-4fed-92df-59cea69f6603	Yara Ahmed	Founder Member	Login	Auth	User logged in: Yara Ahmed	نجح	::1	\N	\N	2026-02-18 13:23:29.583
0baa74cd-f2fc-4c07-b10d-c74fb15ad238	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-18 13:29:01.728
6e7fec3b-32e0-494f-ba53-380e6eaae75c	Admin User	admin	Register	Staff	Registered new staff member: Stafffffffff St	نجح	::1	\N	{"email": "staff.11223377889955@helwan-club.local", "message": "Staff member registered successfully", "success": true, "staff_id": 27, "account_id": 114}	2026-02-18 13:38:34.334
7b2ebea8-32f4-4ae8-b039-aaf4275d6bf7	Admin User	admin	Register	Staff	Registered new staff member: Staffffffffffff St	نجح	::1	\N	{"email": "staff.11223377889959@helwan-club.local", "message": "Staff member registered successfully", "success": true, "staff_id": 28, "account_id": 115}	2026-02-18 13:45:13.559
71176f03-8d0d-47cb-945a-cfb901de18bd	Admin User	admin	Register	Staff	Registered new staff member: Stafffffffffffff St	نجح	::1	\N	{"email": "staff.11223377884444@helwan-club.local", "message": "Staff member registered successfully", "success": true, "staff_id": 29, "account_id": 116}	2026-02-18 13:47:13.77
a026d89b-885d-41b6-897c-42d652006066	Admin User	admin	Assign Packages	Staff	Assigned privilege packages to staff ID: 29	نجح	::1	\N	{"package_ids": [5]}	2026-02-18 13:47:16.061
78ccfde7-4655-48c3-ab29-6ceca3cd10c8	Stafffffffffffff St	HR and Membership Affairs Manager	Login	Auth	User logged in: Stafffffffffffff St	نجح	::1	\N	\N	2026-02-18 13:48:23.855
01938b08-7771-41f5-b44b-d16a23d91613	Stafffffffffffff St	HR and Membership Affairs Manager	Change Credentials	Auth	User changed credentials: Stafffffffffffff St	نجح	::1	\N	\N	2026-02-18 13:48:50.666
ab6f14f2-27e5-4805-9d8f-4813a026c193	Stafffffffffffff St	HR and Membership Affairs Manager	Login	Auth	User logged in: Stafffffffffffff St	نجح	::1	\N	\N	2026-02-18 13:49:11.196
fb8f55bd-3d38-44f2-a01a-3610452cd4f5	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-18 13:50:57.536
f944e005-b5c9-4249-b23d-fd0a1cfc6c43	Admin User	admin	Register	Staff	Registered new staff member: Stafftwo St	نجح	::1	\N	{"email": "staff.11223377889999@helwan-club.local", "message": "Staff member registered successfully", "success": true, "staff_id": 30, "account_id": 117}	2026-02-18 13:51:53.878
0609d951-d6f7-446d-95c4-66cc4301052d	Admin User	admin	Assign Packages	Staff	Assigned privilege packages to staff ID: 30	نجح	::1	\N	{"package_ids": [6]}	2026-02-18 13:51:56.734
0b7ba8af-6969-4353-b746-a2dcc9e5310a	Stafftwo St	HR and Membership Affairs Manager	Login	Auth	User logged in: Stafftwo St	نجح	::1	\N	\N	2026-02-18 13:52:29.375
c9957e4b-6540-4a49-813d-9c71861c5271	Stafftwo St	HR and Membership Affairs Manager	Change Credentials	Auth	User changed credentials: Stafftwo St	نجح	::1	\N	\N	2026-02-18 13:52:51.065
eec48ac5-0441-4cce-85a3-b0043775d63e	Stafftwo St	HR and Membership Affairs Manager	Login	Auth	User logged in: Stafftwo St	نجح	::1	\N	\N	2026-02-18 13:53:09.289
3aac878e-add0-48af-90ba-e94bb4bacfe8	Media Specialist	Media Specialist	Login	Auth	User logged in: Media Specialist	نجح	::1	\N	\N	2026-02-18 13:54:41.891
0bdf2b58-e2d2-41a2-8036-95d8887ab13c	Media Specialist	Media Specialist	Create	MediaGallery	Created media post: sports	نجح	::1	\N	{"id": 3, "date": "2026-02-18T11:56:03.430Z", "title": "sports", "images": ["/uploads/images-1771415763428-362166352.jpg"], "category": "صور", "videoUrl": "", "created_at": "2026-02-18T09:56:06.024Z", "updated_at": "2026-02-18T09:56:06.024Z", "description": "new sport alert", "videoDuration": null}	2026-02-18 13:56:06.29
7a55b7f2-4dbd-4f0d-a15f-e39139000285	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-18 13:57:08.858
2a2d3021-4fc1-4072-9486-71c6bb5cf4fd	Admin User	Admin	Approve	Members	Approved membership request for: VIP Zed VIP Zed	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-18 13:59:47.967
01e29a94-bde2-4b3b-8172-22ef6cd2b2de	Admin User	admin	Register	Staff	Registered new staff member: CEO NEWW kkkkk	نجح	::1	\N	{"email": "staff.11447788552266@helwan-club.local", "message": "Staff member registered successfully", "success": true, "staff_id": 31, "account_id": 118}	2026-02-18 14:08:34.587
6b865346-6dba-4532-b74d-f7e7b9785f91	Admin User	admin	Assign Packages	Staff	Assigned privilege packages to staff ID: 31	نجح	::1	\N	{"package_ids": [3]}	2026-02-18 14:08:37.51
adf5bba6-041e-4a6b-84c0-25a58fab3420	CEO NEWW kkkkk	Executive Director	Login	Auth	User logged in: CEO NEWW kkkkk	نجح	::1	\N	\N	2026-02-18 14:09:19.194
39309a51-5e60-47b8-97f7-e91a2afc7c2e	CEO NEWW kkkkk	Executive Director	Change Credentials	Auth	User changed credentials: CEO NEWW kkkkk	نجح	::1	\N	\N	2026-02-18 14:09:54.665
1b177550-cb4e-41a7-afb7-cfe4fc8fd9aa	CEO NEWW kkkkk	Executive Director	Login	Auth	User logged in: CEO NEWW kkkkk	نجح	::1	\N	\N	2026-02-18 14:10:14.615
53dbe91f-9855-4006-84ce-041e2f351150	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-18 15:09:19.094
e041b057-8e0c-4d2f-8d3e-657c3ee4a228	Media Specialist	Media Specialist	Login	Auth	User logged in: Media Specialist	نجح	::1	\N	\N	2026-02-18 15:09:48.084
752a1e8c-28a2-4d0c-a9a1-c7421f8b1284	Yara Ahmed	Founder Member	Login	Auth	User logged in: Yara Ahmed	نجح	::1	\N	\N	2026-02-18 15:10:31.799
e0b57a69-dfb8-4cb3-9036-48888c0ec3cd	Yara Ahmed	Founder Member	Login	Auth	User logged in: Yara Ahmed	نجح	::1	\N	\N	2026-02-18 15:11:12.772
6f493ef6-cbd5-4780-9f57-69e8065b19be	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-18 15:20:37.33
ee771a3c-b9c0-4e9f-bd71-11799012c3cb	Admin User	admin	Register	Staff	Registered new staff member: Zeyad KKKK	نجح	::1	\N	{"email": "staff.11447755882299@helwan-club.local", "message": "Staff member registered successfully", "success": true, "staff_id": 32, "account_id": 119}	2026-02-18 15:36:16.363
8ffdbf43-b7d7-4c88-b186-2440244a3c9d	Zeyad KKKK	HR and Membership Affairs Manager	Login	Auth	User logged in: Zeyad KKKK	نجح	::1	\N	\N	2026-02-18 15:37:26.998
71171ddd-5c9d-46f2-87fe-75a3298d29d8	Zeyad KKKK	HR and Membership Affairs Manager	Change Credentials	Auth	User changed credentials: Zeyad KKKK	نجح	::1	\N	\N	2026-02-18 15:38:57.161
e9ba817e-bb9c-492b-b399-22632c8adc16	Zeyad KKKK	HR and Membership Affairs Manager	Login	Auth	User logged in: Zeyad KKKK	نجح	::1	\N	\N	2026-02-18 15:39:14.56
7bf5bc94-8d89-4d08-b6cd-7130ab5af63c	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-19 10:32:25.626
b8232386-1319-432b-a9f3-7a7f55a7160c	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-19 11:04:49.719
b2521f88-f360-4b3b-b953-d375201ae093	Admin User	Admin	Approve	Members	Approved membership request for: RRRRR RRRRR	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-19 11:05:12.99
6170316e-93bf-4287-912e-3f6d73d4475c	Media Specialist	Media Specialist	Login	Auth	User logged in: Media Specialist	نجح	::1	\N	\N	2026-02-19 11:10:03.822
766807ee-6186-4079-b08f-6347861c0ba4	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-19 11:33:58.332
e6524100-f23e-45d0-878a-0d55a1c60838	RRRRR RRRRR	Founder Member	Login	Auth	User logged in: RRRRR RRRRR	نجح	::1	\N	\N	2026-02-19 13:51:23.257
140065d2-6fe0-45a9-94d7-a0c5ca1b74f7	RRRRR RRRRR	Founder Member	Login	Auth	User logged in: RRRRR RRRRR	نجح	::1	\N	\N	2026-02-19 14:01:46.599
02f3f3cc-7a60-4c67-a694-24d2b0ffecfc	RRRRR RRRRR	Founder Member	Login	Auth	User logged in: RRRRR RRRRR	نجح	::1	\N	\N	2026-02-19 14:02:55.878
661b90a7-f613-4e1e-8121-f10071faefc8	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-19 14:03:25.104
1bdb8960-5a95-4065-8cab-16730535a8ac	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-19 14:08:46.391
6ef38ecf-c958-4ec6-8e83-c26dddb69d29	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-19 14:08:58.769
21874873-cb79-4db0-a875-0a43181a4ee2	Admin User	Admin	Approve	Members	Approved membership request for: zed Zed	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-19 14:09:09.529
71551ac3-8a5c-4bbe-8ad0-42c79205b136	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-19 14:09:24.778
0204a12c-3552-44e5-b201-de145e634484	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-19 14:12:39.549
d3d61a56-baeb-4942-b8b5-5ff553e1e752	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-19 14:21:58.418
a34a1899-74d9-4f90-af8d-35ae33085c08	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-19 14:27:33.221
b13f747e-e5b9-410c-a10c-56fbf0a4ab7e	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-19 14:28:04.9
06fe76e3-c54e-4af1-9bda-f4304439db53	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-19 14:30:40.273
30c09432-4732-419d-b312-7f03e08c5bcf	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-19 14:33:09.547
0a0498ea-4f18-4405-84cd-acb67512e5cc	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-19 14:33:50.488
3df45713-eb00-4f92-ae9c-3e7f21aac50b	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-19 14:36:50.371
d9023855-2b63-4f32-805c-e563b3ff715d	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-19 14:37:12.005
1fdc1c6d-e620-435d-98c1-2ffcb1bc0a63	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-19 14:38:08.612
b16bbcf7-5d96-495b-a8f1-8db2e92e2c6c	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-19 14:43:47.904
4212d165-dca7-496b-b4cf-a20ecf8d61fc	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-19 14:44:32.959
16ef8b4d-338d-4f36-86a3-011db9520dbb	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-19 14:46:10.591
1e561329-4095-448e-9bf4-a1be551ebf5c	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-19 14:46:53.307
188d4cfa-6eb8-4d29-b7e7-9782d84f943b	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-19 14:49:10.628
d444347b-76c7-4a2f-87f5-676a8762a090	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-19 14:49:54.056
a2dcded7-91ee-4291-9a3e-0ee2c1ba2732	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-19 14:50:21.146
6a021f4b-60f6-4d43-8c76-57ada3526d9d	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-19 14:50:53.823
cfd9f729-aa0d-43f0-a05b-3ac54bdd0e89	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-19 14:52:44.597
e7dc9289-c46e-4982-8f55-95ad16a0743a	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-19 14:55:00.927
bcb4266b-f2c5-4786-8c71-3e8d6f1ea7b7	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-19 15:00:21.852
06090414-f6f6-47c2-866d-fa9e098e440a	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-19 15:01:39.796
d031e0c0-87d7-4f12-a7c5-2f4b50a4a934	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-19 17:17:30.853
5383a0bf-5c0d-4b9d-8ecd-6150e4a96753	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-19 17:20:52.424
30955902-966b-44c4-94a7-06ca3e51a799	Admin User	Admin	Approve	Members	Approved membership request for: RRRRR RRRRR	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-19 20:39:36.335
a58f5cdb-75cd-4a3c-8ce7-2e923da27026	Admin User	Admin	Approve	Members	Approved membership request for: RRRRR RRRRR	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-19 20:39:55.637
e78f6d71-de19-4dfc-8e79-5864e243ee7e	Admin User	Admin	Approve	Members	Approved membership request for: RRRRR RRRRR	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-19 21:21:37.195
c3290137-b75b-4461-a9ff-b51d7669a1cd	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-19 23:29:03.928
ff5014aa-c9ae-45a8-82bc-2290faf21e57	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-19 23:33:21.346
c8c40d66-c65b-484a-9251-bdcc257edf5d	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-19 23:35:03.694
a019fa28-ef33-4b4c-beef-3fd9c9969d08	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-19 23:41:34.145
2ccc5ee1-b20f-4f34-a03b-34428e7819d2	Admin User	Admin	Approve	Members	Approved membership request for: uuu ppp	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-20 00:27:52.554
5c05f44b-5e78-4676-9be9-ee21438dbc34	admin@club.com	admin	Update	MembershipPlans	Updated membership plan: Founder Member	نجح	::1	{"id": 16, "price": 200, "max_age": null, "min_age": null, "name_ar": "العضو المؤسس", "name_en": "Founder Member", "currency": "EGP", "is_active": true, "plan_code": "FOUNDER", "created_at": "2026-01-24T13:50:34.451Z", "updated_at": "2026-02-15T20:01:49.650Z", "renewal_price": 50, "description_ar": null, "description_en": "Founding member - lifetime privileges", "is_installable": false, "member_type_id": 1, "duration_months": 13, "is_for_foreigner": false, "max_installments": null}	{"id": 16, "price": 200, "max_age": null, "min_age": null, "name_ar": "العضو المؤسس", "name_en": "Founder Member", "currency": "EGP", "is_active": true, "plan_code": "FOUNDER", "created_at": "2026-01-24T13:50:34.451Z", "updated_at": "2026-02-19T20:56:02.714Z", "renewal_price": 50, "description_ar": null, "description_en": "Founding member - lifetime privileges", "is_installable": false, "member_type_id": 1, "duration_months": 13, "is_for_foreigner": false, "max_installments": null}	2026-02-20 00:56:03.135
c8d18fd1-df1c-424f-96fe-739739b17898	Admin User	admin	Assign Packages	Staff	Assigned privilege packages to staff ID: 23	نجح	::1	\N	{"package_ids": [5]}	2026-02-20 01:28:38.731
dde12f63-374e-4353-8831-31d5459af22f	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-20 01:29:00.998
f67d7c9b-f1d5-4b14-9446-b190440e29c1	Admin User	admin	Register	Staff	Registered new staff member: Nigger  migger	نجح	::1	\N	{"email": "staff.22222222222222@helwan-club.local", "message": "Staff member registered successfully", "success": true, "staff_id": 33, "account_id": 128}	2026-02-20 01:30:08.754
5bc70ed4-5209-4979-b828-a699936ffbe8	Admin User	admin	Assign Packages	Staff	Assigned privilege packages to staff ID: 33	نجح	::1	\N	{"package_ids": [5]}	2026-02-20 01:30:10.386
eec3b94f-44f3-479e-b152-355c973ffcd4	Nigger  migger	Executive Director	Login	Auth	User logged in: Nigger  migger	نجح	::1	\N	\N	2026-02-20 01:30:27.385
88afc21b-fdef-4a89-b045-bc8f573c73d2	Nigger  migger	Executive Director	Change Credentials	Auth	User changed credentials: Nigger  migger	نجح	::1	\N	\N	2026-02-20 01:30:43.094
3f0f2f8f-4355-4709-b4f4-0271615e7ea8	Nigger  migger	Executive Director	Login	Auth	User logged in: Nigger  migger	نجح	::1	\N	\N	2026-02-20 01:30:53.474
44278c23-9899-4b2c-b07d-a6ec0b36c6a9	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-20 02:52:48.287
716fca96-2bee-43f1-96dc-e835a30c8b11	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-20 04:09:49.911
b232e5f7-feb6-4fd2-b94c-cc105c8a87d0	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-20 04:12:50.958
cc267bc4-ba0c-4660-a415-80d485f71fde	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-20 04:29:50.798
dc383a90-c957-49ec-8549-5ab2f28760d9	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-20 14:55:30.868
19d34892-dd53-4638-96f8-2121c29ccda1	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-20 15:14:50.589
03ae2710-b94e-4374-80e9-2b6de9be54ae	Admin User	admin	Register	Staff	Registered new staff member: Mo MOMOM	نجح	::1	\N	{"email": "staff.12444444444444@helwan-club.local", "message": "Staff member registered successfully", "success": true, "staff_id": 34, "account_id": 129}	2026-02-20 15:24:05.001
79fb2a6d-5a73-4aeb-80e6-0b921344d9be	Admin User	admin	Register	Staff	Registered new staff member: Mo MOMOM	نجح	::1	\N	{"email": "staff.12444444444443@helwan-club.local", "message": "Staff member registered successfully", "success": true, "staff_id": 35, "account_id": 130}	2026-02-20 15:27:36.51
63cbe201-19a9-407d-aa0c-2e94a951cf37	Admin User	admin	Assign Packages	Staff	Assigned privilege packages to staff ID: 35	نجح	::1	\N	{"package_ids": [4]}	2026-02-20 15:27:38.442
4f5d08df-e289-4a08-b978-5851028e2855	Admin User	admin	Register	Staff	Registered new staff member: Mahmoud Hesham	نجح	::1	\N	{"email": "staff.11111111111131@helwan-club.local", "message": "Staff member registered successfully", "success": true, "staff_id": 36, "account_id": 131}	2026-02-20 16:50:23.687
d4e54c65-854b-4fa9-8c56-0ea727fd2569	Admin User	admin	Assign Packages	Staff	Assigned privilege packages to staff ID: 36	نجح	::1	\N	{"package_ids": [5]}	2026-02-20 16:50:25.325
f39142b6-da25-48e7-a2ac-04dfb73b00e6	Mahmoud Hesham	Sports Activity Specialist	Login	Auth	User logged in: Mahmoud Hesham	نجح	::1	\N	\N	2026-02-20 16:52:28.389
f8fa76e0-d2c4-4f38-8743-46c987658cce	Mahmoud Hesham	Sports Activity Specialist	Change Credentials	Auth	User changed credentials: Mahmoud Hesham	نجح	::1	\N	\N	2026-02-20 16:54:12.531
07a170e6-d90e-400d-9284-a0552628bb9b	Mahmoud Hesham	Sports Activity Specialist	Login	Auth	User logged in: Mahmoud Hesham	نجح	::1	\N	\N	2026-02-20 16:54:41.756
fdfad84a-c295-408e-8f83-98590d7f5452	Admin User	admin	Register	Staff	Registered new staff member: testing testintinitn	نجح	::1	\N	{"email": "staff.11111131313131@helwan-club.local", "message": "Staff member registered successfully", "success": true, "staff_id": 37, "account_id": 132}	2026-02-20 16:55:40.555
d063eb16-1913-440e-86b1-d811065bfec5	Admin User	admin	Assign Packages	Staff	Assigned privilege packages to staff ID: 37	نجح	::1	\N	{"package_ids": [5]}	2026-02-20 16:55:41.631
165b6ff6-2a89-4c25-84ca-533739533f14	Testing111 Testinggg22	Founder Member	Login	Auth	User logged in: Testing111 Testinggg22	نجح	::1	\N	\N	2026-02-20 17:00:37.974
239d834b-0c40-428b-8a27-91bc2cf1e847	Admin User	Admin	Approve	Members	Approved membership request for: Testing111 Testinggg22	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-20 17:01:03.986
14bf05b1-ab60-4c23-a515-41a522ee706e	ada awd	Founder Member	Login	Auth	User logged in: ada awd	نجح	::1	\N	\N	2026-02-20 17:02:39.466
6bc1d63f-0816-470b-bfdf-d296a10560bd	awdawd awdawdaw	Founder Member	Login	Auth	User logged in: awdawd awdawdaw	نجح	::1	\N	\N	2026-02-20 17:05:01.864
dcf26e3c-ca58-4025-93b9-3d3f1a4d04a5	Admin User	Admin	Approve	Members	Approved membership request for: awdawd awdawdaw	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-20 17:07:06.145
776813ee-bc97-499c-8be1-6dc072b62898	RRRRR RRRRR	Founder Member	Login	Auth	User logged in: RRRRR RRRRR	نجح	::1	\N	\N	2026-02-20 17:10:03.782
a23e327e-8242-482b-becd-58bec045f215	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-20 17:11:31.183
65243e9d-ddfe-4f3f-a667-e021115b55c6	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-20 17:11:59.301
3ef67cd3-25e0-4438-a53b-14d526e48c6e	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-20 17:14:10.156
cf996ced-033c-4785-83e3-1d8d6eac889f	Media Specialist	Media Specialist	Login	Auth	User logged in: Media Specialist	نجح	::1	\N	\N	2026-02-20 17:16:36.306
ef1e5c6d-a4d4-4e80-b476-cd985c84e3c2	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-20 17:27:11.221
ad44e04f-1a32-4a40-b720-bfb70daa17c5	Admin User	Admin	Create	MediaGallery	Created media post: New Post	نجح	::1	\N	{"id": 4, "date": "2026-02-20T15:38:36.261Z", "title": "New Post", "images": ["/uploads/images-1771601916257-50229832.jpg"], "category": "عرض ترويجي", "videoUrl": "", "created_at": "2026-02-20T13:38:38.485Z", "updated_at": "2026-02-20T13:38:38.485Z", "description": "wertyuiopiuyrewertyuuytree", "videoDuration": null}	2026-02-20 17:38:37.412
9a3ca970-6432-4cde-a447-f984f0172715	Admin User	Admin	Create	MediaGallery	Created media post: wqwertrewer	نجح	::1	\N	{"id": 5, "date": "2026-02-20T15:43:55.399Z", "title": "wqwertrewer", "images": ["/uploads/images-1771602235397-432769962.jpg"], "category": "إعلان", "videoUrl": "", "created_at": "2026-02-20T13:43:57.689Z", "updated_at": "2026-02-20T13:43:57.689Z", "description": "zxnmgfdsdfghjgfdfghj", "videoDuration": null}	2026-02-20 17:43:56.601
9d66a932-6c34-418a-8eb6-df2bf38952bb	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-20 18:52:41.356
c7ecb497-1ba4-4841-ad2e-676d0ffaddcc	Yara Ahmed	Founder Member	Login	Auth	User logged in: Yara Ahmed	نجح	::1	\N	\N	2026-02-20 19:00:39.02
1117d742-2aae-4b58-8949-6736f686f0bf	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-20 20:42:12.384
9db46a3d-a3fa-4ed9-add3-81b41e72ff21	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-20 20:42:52.788
763875bb-a080-4347-83c8-1d54299fce50	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-20 20:46:08.949
038eb5f1-45de-47f7-a582-e1240fa7a8ff	Admin User	Admin	Create	MediaGallery	Created media post: ~سشسيشسيشسيب	نجح	::1	\N	{"id": 6, "date": "2026-02-20T18:52:53.797Z", "title": "~سشسيشسيشسيب", "images": ["/uploads/images-1771613573756-149598988.jpg"], "category": "أخبار", "videoUrl": "", "created_at": "2026-02-20T16:52:56.047Z", "updated_at": "2026-02-20T16:52:56.047Z", "description": "شسيشسيشسيشسيشسيشسيشسيشسيشسيشيشسيشيشسيشسيشسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسشششششششششش", "videoDuration": null}	2026-02-20 20:52:55.665
5432ec81-4cdf-40ba-aa01-606570bdab86	Admin User	admin	Create Package	Staff	Created privilege package: PKG_1771616802611	نجح	::1	\N	{"id": 2, "code": "PKG_1771616802611", "name_ar": "باقه المدير", "name_en": "باقه المدير", "is_active": true, "created_at": "2026-02-20T17:46:45.599Z", "updated_at": "2026-02-20T17:46:45.599Z", "description_ar": null, "description_en": null, "privileges_count": 30}	2026-02-20 21:46:48.48
e60c668b-9552-4390-bc82-42976be69519	Admin User	Admin	Approve	Members	Approved membership request for: emppp emppp	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-20 21:49:17.94
8aa72d88-fb5f-4f20-b22a-b90a9f53b312	Admin User	admin	Deactivate	Staff	Deactivated staff member ID: 12	نجح	::1	\N	{"status": "inactive", "is_active": false}	2026-02-20 21:54:51.281
fa4965f5-7df6-47d9-84d0-0968a983f161	Admin User	admin	Deactivate	Staff	Deactivated staff member ID: 12	نجح	::1	\N	{"status": "inactive", "is_active": false}	2026-02-20 21:54:51.285
b53f0bad-abbf-4f0f-a70d-08b895f0c917	Admin User	admin	Deactivate	Staff	Deactivated staff member ID: 12	نجح	::1	\N	{"status": "inactive", "is_active": false}	2026-02-20 21:54:51.43
a6835384-cfa3-4125-897d-b8cb38c36484	Admin User	admin	Deactivate	Staff	Deactivated staff member ID: 12	نجح	::1	\N	{"status": "inactive", "is_active": false}	2026-02-20 21:54:51.435
9fc65ee9-aca9-4c0d-b02a-ed4f38123a1b	Admin User	admin	Deactivate	Staff	Deactivated staff member ID: 12	نجح	::1	\N	{"status": "inactive", "is_active": false}	2026-02-20 21:54:53.585
9c581cbf-cd6c-42ef-b29e-fa05573dc37d	Admin User	admin	Deactivate	Staff	Deactivated staff member ID: 12	نجح	::1	\N	{"status": "inactive", "is_active": false}	2026-02-20 21:54:54.136
ba5a9514-1c9a-4d9e-958a-1652f334261f	Admin User	admin	Deactivate	Staff	Deactivated staff member ID: 12	نجح	::1	\N	{"status": "inactive", "is_active": false}	2026-02-20 21:54:54.137
d87d29c7-d2dd-4e8c-abe1-b83701ed71a3	Admin User	admin	Deactivate	Staff	Deactivated staff member ID: 12	نجح	::1	\N	{"status": "inactive", "is_active": false}	2026-02-20 21:54:54.408
9797df1f-f552-42f0-8406-80ff3ab4c6ce	Admin User	admin	Deactivate	Staff	Deactivated staff member ID: 12	نجح	::1	\N	{"status": "inactive", "is_active": false}	2026-02-20 21:54:54.623
fc2e7803-c4e4-4263-b803-2d2ceb41c15e	Admin User	admin	Deactivate	Staff	Deactivated staff member ID: 12	نجح	::1	\N	{"status": "inactive", "is_active": false}	2026-02-20 21:54:54.717
282fc648-09a9-4839-813b-07512c721110	Admin User	admin	Deactivate	Staff	Deactivated staff member ID: 12	نجح	::1	\N	{"status": "inactive", "is_active": false}	2026-02-20 21:54:55.749
c583a855-f0e8-48cd-8830-17291d40c83a	Admin User	admin	Update	Staff	Updated staff member ID: 1	نجح	::1	\N	{"address": "Cairo", "last_name_ar": "مستخدم", "last_name_en": "User", "first_name_ar": "مسؤول", "first_name_en": "Admin"}	2026-02-20 22:21:36.588
7da1251f-26a9-48f7-b362-fa59a0e21934	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-21 00:25:11.976
3602bcba-6c78-464e-a93a-12ffd147e171	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-21 00:27:28.646
26613794-db3b-4c87-89cc-d4e003680e46	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-21 00:27:41.928
e8a04699-a1ca-48ee-b442-745822113b9a	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-21 00:27:59.305
f79ee8ca-5389-4eb5-a025-b9f04af2ab40	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-21 00:30:05.358
b3cfa614-e7a0-47f2-98f2-cc8b665f816c	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-21 00:32:45.32
22baf077-7912-48de-bbba-0e467f644ce5	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-21 01:05:56.637
09c02457-81cf-4a64-94d9-516d84a950aa	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-21 01:07:37.848
087be0bf-e5b0-4ba6-9cc7-d4265aed8b73	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-21 01:09:56.468
e44ae7a9-375f-41c3-93e9-9e43df827aa3	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-21 01:11:35.769
502a3162-a8e3-4a7d-ab45-d9efb1074137	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-21 01:12:42.067
1ec0f81f-97b5-4d96-a67d-0629d1261705	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-21 01:14:14.26
029877a8-9b7c-4fca-b7bd-34e972fc187e	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-21 02:02:30.229
8b58743e-d00c-4dac-8ac3-b847a54af507	Admin User	Admin	Status Change	Members	Changed status of member Kora to active	نجح	::1	{"oldStatus": "active"}	{"newStatus": "active"}	2026-02-21 03:13:33.163
96c165bc-99c8-4204-ad54-9077febafa5e	Admin User	Admin	Approve	Members	Approved membership request for: Yara Ahmed	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-21 03:34:21.714
3ca8df02-a4bd-45f6-8b36-09d58c4808bb	Admin User	Admin	Approve	Members	Approved membership request for: mm nnn	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-21 04:03:04.596
e49c09af-d5a8-4ef1-889b-b4aa2af91c7e	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-21 04:12:05.236
eb8f5ce4-30cf-4c35-b7c0-d55079c87374	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-21 04:12:07.489
f68223b4-62db-4303-9146-6f44c027b52a	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-21 11:43:45.135
13ca2d2d-6023-4a53-aae6-e8f37c6afa45	Admin User	Admin	Approve	Members	Approved membership request for: Ahmed Mohammed	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-21 12:06:10.631
c1e68dd9-de96-42d1-9460-066effa7b366	Ahmed Mohammed	Team Member	Login	Auth	User logged in: Ahmed Mohammed	نجح	::1	\N	\N	2026-02-21 12:06:47.698
0e3d4478-f1c3-4b65-af41-2a83c12ae666	Ahmed Mohammed	Team Member	Login	Auth	User logged in: Ahmed Mohammed	نجح	::1	\N	\N	2026-02-21 12:09:08.585
48f4a4a8-87e9-45d9-b066-64771af10b36	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-21 12:25:41.245
4c7819cf-10b2-4ea8-85bf-19928a748461	Admin User	Admin	Approve	Members	Approved membership request for: Younis Ahmed	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-21 13:05:07.954
12841186-64c3-4a5b-8677-02f9cc660b18	Admin User	Admin	Approve	Members	Approved membership request for: skskks ppp	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-21 13:05:11.473
90f4aa7a-2574-4601-b146-007bba9447e7	Admin User	Admin	Approve	Members	Approved membership request for: Yara Ahmed	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-21 13:05:30.718
18b75ad4-45c5-44cd-8848-c6b2bcb73298	Admin User	Admin	Approve	Members	Approved membership request for: Yara Ahmed	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-21 13:05:36.993
ab354506-6ce3-4108-903e-b4514abb6a32	Admin User	Admin	Approve	Members	Approved membership request for: Yara Ahmed	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-21 13:06:03.495
e26b055a-0c07-484d-970f-f23377cfe9a3	Admin User	Admin	Approve	Members	Approved membership request for: kk ll	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-21 13:06:06.307
39686806-b4fd-4094-a735-ecf1b3a0beeb	Admin User	Admin	Approve	Members	Approved membership request for: Yara Ahmed	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-21 13:06:09.941
5f6a3d6a-f813-414c-b03e-a5771fccd252	Admin User	Admin	Approve	Members	Approved membership request for: Yara Ahmed	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-21 13:06:17.169
7a4984a4-825c-4f78-be4c-893a95e41fc3	Admin User	Admin	Approve	Members	Approved membership request for: Yara Ahmed	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-21 13:06:19.544
606e8642-46cd-4794-a162-6aa4ab586d17	Admin User	Admin	Approve	Members	Approved membership request for: Ahmed Mohammed	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-21 13:11:18.558
c5fcf765-c260-4aa2-8d3d-bbe527e63e89	Admin User	Admin	Approve	Members	Approved membership request for: Ahmed Mohammed	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-21 13:18:27.602
e2931fd3-864a-4e2a-958a-714aa219a1ce	Admin User	Admin	Approve	Members	Approved membership request for: zeyad alaa	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-21 13:18:36.559
3ba98e8e-b251-43aa-9c04-3a3bc1b51825	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-21 14:01:35.424
f1998ce4-05b1-4bdb-8a28-639187459a17	Omar Khyrat	Team Member	Login	Auth	User logged in: Omar Khyrat	نجح	::1	\N	\N	2026-02-21 14:03:50.571
c744ee5e-ec00-4d60-8c83-58cb00b52d72	Omar Khyrat	Team Member	Login	Auth	User logged in: Omar Khyrat	نجح	::1	\N	\N	2026-02-21 14:05:44.926
3ea8df65-a84a-44d3-9f3a-85ae7196137b	Omar Khyrat	Team Member	Login	Auth	User logged in: Omar Khyrat	نجح	::1	\N	\N	2026-02-21 14:08:53.745
ac4967c9-0d79-4074-bbb6-4d6c199f184c	zed Zed	Founder Member	Login	Auth	User logged in: zed Zed	نجح	::1	\N	\N	2026-02-21 14:09:20.4
1c3d36ed-3606-4153-8b78-b3e70ba06f90	Omar Khyrat	Team Member	Login	Auth	User logged in: Omar Khyrat	نجح	::1	\N	\N	2026-02-21 14:10:30.508
95c408e4-0675-4f45-ad06-cdad15ceee5d	Omar Khyrat	Team Member	Login	Auth	User logged in: Omar Khyrat	نجح	::1	\N	\N	2026-02-21 14:14:42.108
0b0ab696-5c05-430a-a6f8-aff0cb13241d	Omar Khyrat	Team Member	Login	Auth	User logged in: Omar Khyrat	نجح	::1	\N	\N	2026-02-21 14:15:29.16
f453c705-cad3-4bb5-82ea-c410644ebec8	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-21 14:16:04.416
cd3c8dbd-f426-42ee-ad2f-8aa35e86d59a	Ahmed Mohammed	Team Member	Login	Auth	User logged in: Ahmed Mohammed	نجح	::1	\N	\N	2026-02-21 14:20:19.771
27c82f3a-9821-4930-8b47-5b796e70fa66	Ahmed Mohammed	Team Member	Login	Auth	User logged in: Ahmed Mohammed	نجح	::1	\N	\N	2026-02-21 14:23:33.537
75a40bee-bb2a-4e26-9af8-ebc69a142677	Omar Khyrat	Team Member	Login	Auth	User logged in: Omar Khyrat	نجح	::1	\N	\N	2026-02-21 14:23:57.066
50478f14-3901-41f3-b5dc-0843581057ee	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-21 14:24:28.477
859eedce-35b5-4f84-ae97-2728a27ffb68	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-21 14:53:44.25
43c5c09f-8c0b-4f72-95b9-1a4be0859d64	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-21 14:59:46.865
fd82d000-0c3e-4ab5-8e2c-a91fdb49605e	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-21 15:09:22.96
e6329cf8-3f3f-47de-be20-d4b6e49cf810	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-21 15:16:39.558
2eedb18e-539c-4b08-a19c-ab6b3f4207a0	Admin User	Admin	Approve	Members	Approved membership request for: awdad awdadad	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-21 15:16:56.233
08ae2f85-9f4e-405e-866c-6b2833d983ed	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-21 15:17:49.258
f4af733c-a89a-4551-b135-14b763237380	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-21 15:47:49.536
fe9b79f1-2cc6-46c7-afca-358b319ccb0f	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-21 16:10:13.704
67cd069a-5a51-4550-801b-2c6042943ba6	Ahmed Mohammed	Team Member	Login	Auth	User logged in: Ahmed Mohammed	نجح	::1	\N	\N	2026-02-21 16:13:38.308
0f975e60-dcdf-4a3d-8b7d-199fae534ccc	Admin User	Admin	Create	Sports	Created sport: Gymnastics (جمباز)	نجح	0.0.0.0	\N	{"id": 10, "price": 2000, "status": "active", "name_ar": "جمباز", "name_en": "Gymnastics", "is_active": true, "created_at": "2026-02-21T12:16:57.562Z", "updated_at": "2026-02-21T12:16:57.562Z", "approved_at": "2026-02-21T14:16:57.259Z", "sport_image": null, "description_ar": null, "description_en": null, "max_participants": 0, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	2026-02-21 16:16:57.498
65678646-851e-4e73-b3c4-364eb1ac39cb	Admin User	admin	Create Package	Staff	Created privilege package: PKG_1771683880570	نجح	::1	\N	{"id": 7, "code": "PKG_1771683880570", "name_ar": "مدير الموارد البشرية و العضويات", "name_en": "مدير الموارد البشرية و العضويات", "is_active": true, "created_at": "2026-02-21T12:24:41.618Z", "updated_at": "2026-02-21T12:24:41.618Z", "description_ar": null, "description_en": null, "privileges_count": 36}	2026-02-21 16:24:44.593
b72c7eab-38b9-4051-be24-ec3db2fee67c	Admin User	Admin	Approve	Members	Approved membership request for: Kerolos Maged	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-21 23:34:47.487
87227570-ff84-496d-8255-eca22c49264c	Admin User	admin	Register	Staff	Registered new staff member: Yara Ahmed	نجح	::1	\N	{"email": "staff.77446699330011@helwan-club.local", "message": "Staff member registered successfully", "success": true, "staff_id": 38, "account_id": 166}	2026-02-21 16:27:20.85
ce568e83-f907-4435-acbc-8aebee808cbb	Admin User	admin	Assign Packages	Staff	Assigned privilege packages to staff ID: 38	نجح	::1	\N	{"package_ids": [7]}	2026-02-21 16:27:21.892
efa15eb2-d119-4182-ad25-6dd6e843fb88	Admin User	admin	Grant Privilege	Staff	Granted privileges to staff ID: 38	نجح	::1	\N	{"ids": [63, 65, 62, 64, 66], "reason": "Assigned during staff creation"}	2026-02-21 16:27:24.816
468c84b1-ab5e-47d3-ae42-bf77096cf58b	Yara Ahmed	HR and Membership Affairs Manager	Login	Auth	User logged in: Yara Ahmed	نجح	::1	\N	\N	2026-02-21 16:27:55.037
0104dc86-3456-43d9-aceb-6c6a19911981	Yara Ahmed	HR and Membership Affairs Manager	Change Credentials	Auth	User changed credentials: Yara Ahmed	نجح	::1	\N	\N	2026-02-21 16:28:20.777
a4bc3b5e-eaf8-4169-af8b-9b759d9c2dd1	Yara Ahmed	HR and Membership Affairs Manager	Login	Auth	User logged in: Yara Ahmed	نجح	::1	\N	\N	2026-02-21 16:28:37.076
49a9c3ad-2cca-4b6b-b6cf-97cc3123ff5a	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-21 16:31:17.784
25cce341-f3a0-424c-9ede-a8139c75bb96	Yara Ahmed	Team Member	Login	Auth	User logged in: Yara Ahmed	نجح	::1	\N	\N	2026-02-21 16:35:10.293
be84397c-ce27-454e-a4d8-8a9048e78237	Rahma Tarek	Team Member	Login	Auth	User logged in: Rahma Tarek	نجح	::1	\N	\N	2026-02-21 16:40:49.138
03d49a00-dcef-4a12-b0c5-45f335bece29	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-21 17:22:19.78
cd139c39-fc53-491f-8877-9fecb823f53f	Ahmed Mohammed	Team Member	Login	Auth	User logged in: Ahmed Mohammed	نجح	::1	\N	\N	2026-02-21 17:27:39.124
8526b568-a459-4c56-890f-f6d0c3e9d3a1	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-21 19:35:07.824
5862bfcb-e728-4ec0-90cc-2df495579aaf	Mohamed Hossam	Founder Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-21 20:18:26.692
138a3bd1-9a9f-4387-89fd-d1098dc983f8	Mohamed Hossam	Founder Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-21 20:23:57.656
bd84ced2-a69e-41a8-b8b7-3f70a204c656	Mohamed Hossam	Founder Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-21 20:27:41.213
9b817a3b-4793-458c-aedd-a45e8e2f7f49	Mohamed Hossam	Founder Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-21 21:12:06.092
cc1a1dcd-bc4a-4db6-9427-071fa0a069ef	Mohamed Hossam	Founder Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-21 21:22:38.172
6ae9a5ff-331a-4056-8477-b3b4d88c2cde	Mohamed Hossam	Founder Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-21 21:30:11.871
961ad4eb-9244-4f07-9311-de3a0febb80f	Mohamed Hossam	Founder Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-21 21:33:06.328
47805a4b-dad9-4b49-bc18-1bbf514d16f6	Mohamed Hossam	Founder Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-21 21:34:12.313
e7eb566f-aba4-41ed-b682-89a5b54d15d9	Mohamed Salem	Founder Member	Login	Auth	User logged in: Mohamed Salem	نجح	::1	\N	\N	2026-02-21 21:38:20.976
88dd1abd-3beb-44cd-afb8-dafd538b3ba6	Mohamed Salem	Founder Member	Login	Auth	User logged in: Mohamed Salem	نجح	::1	\N	\N	2026-02-21 21:55:49.499
f9b0fed3-9f14-402c-8d85-55b51e09f769	Mohamed Hossam	Founder Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-21 21:57:32.299
a46dc0fa-364d-40f5-a028-8a35d7439e59	Mohamed Salem	Founder Member	Login	Auth	User logged in: Mohamed Salem	نجح	::1	\N	\N	2026-02-21 21:59:01.372
e58971e7-d4fa-42af-8339-3ac0e13c9d0e	Mohamed Hossam	Founder Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-21 22:05:56.203
c9ac67d9-1dd1-46c1-832d-b72204355859	Mohamed Salem	Founder Member	Login	Auth	User logged in: Mohamed Salem	نجح	::1	\N	\N	2026-02-21 22:23:10.402
9a29d278-0f04-477f-8635-c8b7eef58af4	Mohamed Hossam	Founder Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-21 22:40:39.628
a3a12e08-795a-4f6b-adf2-4dd2c6ca96e5	Mohamed Salem	Founder Member	Login	Auth	User logged in: Mohamed Salem	نجح	::1	\N	\N	2026-02-21 22:41:00.318
374c7f7d-5382-4f80-9233-d34f43dcaa73	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-21 22:39:27.286
cd9b265b-e070-4ac8-9c37-e35faf4b0cad	Kerolos Maged	Founder Member	Login	Auth	User logged in: Kerolos Maged	نجح	::1	\N	\N	2026-02-21 22:58:53.187
9f8fa0a0-52b7-47ae-a214-82dec9f79258	كيرلس ماجد	Founder Member	Login	Auth	User logged in: كيرلس ماجد	نجح	::1	\N	\N	2026-02-21 23:05:05.255
3ae8c468-11b9-4baa-a4dc-802a414a3b1c	Kerolos Maged	Founder Member	Login	Auth	User logged in: Kerolos Maged	نجح	::1	\N	\N	2026-02-21 23:06:17.637
d9989517-9391-4a9a-a7c5-150bb27e8f63	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-21 23:08:12.821
d288763b-13c4-4f50-9877-2d4e15bdd9c2	Admin User	Admin	Approve	Members	Approved membership request for: كيرلس ماجد	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-21 23:12:01.369
5ba5847b-c166-48b3-b231-67a181699467	Admin User	Admin	Approve	Members	Approved membership request for: Yara Ahmed	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-21 23:12:16.973
77901b32-498d-46f5-94bf-5df156b6dabd	Admin User	Admin	Approve	Members	Approved membership request for: كيرلس ماجد	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-21 23:13:06.029
e630f7c8-f10b-4fda-bdf2-22fd4e73079a	Kerolos Maged	Founder Member	Login	Auth	User logged in: Kerolos Maged	نجح	::1	\N	\N	2026-02-21 23:16:42.677
8a334be8-52ec-4e99-8e06-02bb067ebbec	Admin User	Admin	Approve	Members	Approved membership request for: Kerolos Maged	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-21 23:18:00.296
e48ac711-0e78-427b-874d-ee08ec39225c	Admin User	Admin	Update	Members	Updated member profile: Kerolos Maged	نجح	::1	{"id": 130, "phone": "01222222222", "photo": "uploads\\\\personal_photo-1771708579703-904059313.jpg", "gender": "male", "status": "active", "address": "helwan", "birthdate": "2022-01-31", "account_id": 196, "created_at": "2026-02-21T19:16:27.291Z", "is_foreign": false, "updated_at": "2026-02-21T19:18:06.845Z", "national_id": "22222222222222", "nationality": "Egyptian", "last_name_ar": "Maged", "last_name_en": "Maged", "first_name_ar": "Kerolos", "first_name_en": "Kerolos", "health_status": null, "medical_report": "uploads\\\\medical_report-1771708579796-700581897.jpg", "member_type_id": 1, "points_balance": 0, "national_id_back": "uploads\\\\national_id_back-1771708579752-494505556.jpg", "national_id_front": "uploads\\\\national_id_front-1771708579734-853090659.jpg"}	{"id": 130, "phone": "01222222222", "photo": "uploads\\\\personal_photo-1771708579703-904059313.jpg", "gender": "male", "status": "active", "address": "helwan", "birthdate": "2022-01-31T00:00:00.000Z", "account_id": 196, "created_at": "2026-02-21T19:16:27.291Z", "is_foreign": false, "updated_at": "2026-02-21T19:21:07.394Z", "national_id": "22222222222222", "nationality": "Egyptian", "last_name_ar": "Maged", "last_name_en": "Maged", "first_name_ar": "كيرلس", "first_name_en": "Kerolos", "health_status": null, "medical_report": "uploads\\\\medical_report-1771708579796-700581897.jpg", "member_type_id": 1, "points_balance": 0, "national_id_back": "uploads\\\\national_id_back-1771708579752-494505556.jpg", "national_id_front": "uploads\\\\national_id_front-1771708579734-853090659.jpg"}	2026-02-21 23:21:00.001
dcc9922f-85b7-4065-9334-5f753e82c4bd	Kerolos Maged	Founder Member	Login	Auth	User logged in: Kerolos Maged	نجح	::1	\N	\N	2026-02-21 23:33:19.629
35f877ff-b40e-4d90-b247-541a2024c0ab	mt mt	Team Member	Login	Auth	User logged in: mt mt	نجح	::1	\N	\N	2026-02-23 11:30:32.285
891cb7c9-8176-4bf5-bf15-5b7fa4c6cf0a	عامل Maged	Founder Member	Login	Auth	User logged in: عامل Maged	نجح	::1	\N	\N	2026-02-21 23:42:23.825
09edde01-d052-473d-b3fc-60010e40c12f	Admin User	Admin	Approve	Members	Approved membership request for: عامل Maged	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-21 23:42:47.167
90da1a87-e59c-4ede-be80-50b460dc7deb	Admin User	Admin	Status Change	Members	Changed status of member عامل to suspended	نجح	::1	{"oldStatus": "suspended"}	{"newStatus": "suspended"}	2026-02-21 23:44:27.255
4c26a35f-b7db-4fd1-a7da-c359b3d4316e	Admin User	Admin	Status Change	Members	Changed status of member عامل to expired	نجح	::1	{"oldStatus": "expired"}	{"newStatus": "expired"}	2026-02-21 23:45:12.415
87c7e2f2-83d1-4ba5-8a9d-20fdaa205040	Kerolos Maged	Founder Member	Login	Auth	User logged in: Kerolos Maged	نجح	::1	\N	\N	2026-02-21 23:55:53.892
7f859856-1373-4627-bb49-91c8ed240265	عامل Maged	Founder Member	Login	Auth	User logged in: عامل Maged	نجح	::1	\N	\N	2026-02-22 00:02:42.226
921c6921-3b9e-4bc2-a886-7b630d8c2e45	Kerolos Maged	Founder Member	Login	Auth	User logged in: Kerolos Maged	نجح	::1	\N	\N	2026-02-22 00:05:08.335
dbaae649-b38d-4a2a-9db3-705372719b7f	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-22 00:06:03.369
5f9da877-0ca8-45a0-8732-dd2e29b6db52	admin@club.com	admin	Update	MembershipPlans	Updated membership plan: Founder Member	نجح	::1	{"id": 16, "price": 300, "max_age": null, "min_age": null, "name_ar": "العضو المؤسس", "name_en": "Founder Member", "currency": "EGP", "is_active": true, "plan_code": "FOUNDER", "created_at": "2026-01-24T13:50:34.451Z", "updated_at": "2026-02-19T20:56:02.714Z", "renewal_price": 50, "description_ar": null, "description_en": "Founding member - lifetime privileges", "is_installable": false, "member_type_id": 1, "duration_months": 13, "is_for_foreigner": false, "max_installments": null}	{"id": 16, "price": 300, "max_age": null, "min_age": null, "name_ar": "العضو المؤسس", "name_en": "Founder Member", "currency": "EGP", "is_active": true, "plan_code": "FOUNDER", "created_at": "2026-01-24T13:50:34.451Z", "updated_at": "2026-02-21T20:06:48.980Z", "renewal_price": 50, "description_ar": null, "description_en": "Founding member - lifetime privileges", "is_installable": false, "member_type_id": 1, "duration_months": 13, "is_for_foreigner": false, "max_installments": null}	2026-02-22 00:06:41.099
78d7d5ef-f953-4585-898e-8e680d9a3172	Admin User	Admin	Status Change	Members	Changed status of member عامل to suspended	نجح	::1	{"oldStatus": "suspended"}	{"newStatus": "suspended"}	2026-02-22 00:08:07.935
093ab9ef-142a-4133-93a3-0fdbddc52ddf	عامل Maged	Founder Member	Login	Auth	User logged in: عامل Maged	نجح	::1	\N	\N	2026-02-22 00:08:24.747
7bc945f0-d498-426c-b904-7f6ee8f819fb	Admin User	Admin	Status Change	Members	Changed status of member عامل to active	نجح	::1	{"oldStatus": "active"}	{"newStatus": "active"}	2026-02-22 00:11:36.99
1872f5cf-b977-4a25-9af3-b0b124fc731f	Admin User	Admin	Update	Members	Updated member profile: عامل Maged	نجح	::1	{"id": 134, "phone": "01236666666", "photo": "uploads\\\\personal_photo-1771710122694-324728973.jpg", "gender": "male", "status": "active", "address": "helwan", "birthdate": "2020-02-04", "account_id": 200, "created_at": "2026-02-21T19:42:10.330Z", "is_foreign": false, "updated_at": "2026-02-21T20:11:43.515Z", "national_id": "44444444444442", "nationality": "Egyptian", "last_name_ar": "Maged", "last_name_en": "Maged", "first_name_ar": "عامل", "first_name_en": "عامل", "health_status": null, "medical_report": "uploads\\\\medical_report-1771710122783-394799505.jpg", "member_type_id": 1, "points_balance": 0, "national_id_back": "uploads\\\\national_id_back-1771710122758-763599194.jpg", "national_id_front": "uploads\\\\national_id_front-1771710122715-380486589.jpg"}	{"id": 134, "phone": "01236666666", "photo": "uploads\\\\personal_photo-1771710122694-324728973.jpg", "gender": "male", "status": "active", "address": "helwan", "birthdate": "2020-02-04T00:00:00.000Z", "account_id": 200, "created_at": "2026-02-21T19:42:10.330Z", "is_foreign": false, "updated_at": "2026-02-21T20:12:18.323Z", "national_id": "44444444444442", "nationality": "Egyptian", "last_name_ar": "Maged", "last_name_en": "Maged", "first_name_ar": "عااامل", "first_name_en": "عامل", "health_status": null, "medical_report": "uploads\\\\medical_report-1771710122783-394799505.jpg", "member_type_id": 1, "points_balance": 0, "national_id_back": "uploads\\\\national_id_back-1771710122758-763599194.jpg", "national_id_front": "uploads\\\\national_id_front-1771710122715-380486589.jpg"}	2026-02-22 00:12:10.823
e34da210-983f-4205-9e66-a763ab04fee6	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-22 00:35:44.701
a12e567f-48ad-471b-b677-2344d66472f7	Mohammed Ahmed	Team Member	Login	Auth	User logged in: Mohammed Ahmed	نجح	::1	\N	\N	2026-02-22 00:36:24.046
a7163405-7390-4359-a0cc-e33e136ca725	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-22 00:37:54.333
cd9437ea-947b-44b4-87eb-165bd465dd2c	Kerolos Maged	Working Member	Login	Auth	User logged in: Kerolos Maged	نجح	::1	\N	\N	2026-02-22 00:41:40.671
eb2af111-e980-4b32-a0f9-4d549791ced5	Kerolos Maged	Student Member	Login	Auth	User logged in: Kerolos Maged	نجح	::1	\N	\N	2026-02-22 00:44:03.412
8bd44be7-bbd0-4f28-8c1b-0f5cf9bfef97	Admin User	Admin	Approve	Members	Approved membership request for: Kerolos Maged	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-22 00:44:42.253
a533f3f4-9e6c-4c23-9a5b-cf1fffe1123c	Kerolos Maged	Student Member	Login	Auth	User logged in: Kerolos Maged	نجح	::1	\N	\N	2026-02-22 00:45:09.811
efa02e39-2ccb-42dd-8cb9-a840a0f16a75	Mohammed Ahmed	Team Member	Login	Auth	User logged in: Mohammed Ahmed	نجح	::1	\N	\N	2026-02-22 00:46:34.262
e65ff137-6b14-4900-a53d-c58c4e10ae5d	Kerolos Maged	Working Member	Login	Auth	User logged in: Kerolos Maged	نجح	::1	\N	\N	2026-02-22 00:48:11.014
f23bcfc8-917f-4d13-8795-ea488e11bfaf	Admin User	Admin	Approve	Members	Approved membership request for: Kerolos Maged	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-22 00:48:24.498
1553c849-aa7c-4bd2-b70f-7907681a83ed	Kerolos Maged	Working Member	Login	Auth	User logged in: Kerolos Maged	نجح	::1	\N	\N	2026-02-22 00:48:42.165
e93a5a87-3e0b-4bdc-b498-8dfa3bed3e74	Mohammed Ahmed	Team Member	Login	Auth	User logged in: Mohammed Ahmed	نجح	::1	\N	\N	2026-02-22 00:59:29.425
d8cef2aa-76e0-4e93-8488-bf6a2d6e7849	Kerolos Maged	Dependent Member	Login	Auth	User logged in: Kerolos Maged	نجح	::1	\N	\N	2026-02-22 01:22:16.656
e2ab3e78-7fd0-4964-8dff-b302dac55643	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-22 01:26:14.758
af05bfce-6c9a-451c-94a1-47f0c75a2396	Admin User	Admin	Approve	Members	Approved membership request for: Kerolos Maged	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-22 01:26:30.013
58e0311b-02d1-4c57-b30c-46815abf6ec2	Kerolos Maged	Dependent Member	Login	Auth	User logged in: Kerolos Maged	نجح	::1	\N	\N	2026-02-22 01:30:00.536
8516808d-e150-4db6-b71f-0e27bd5428d6	Kerolos Maged	Dependent Member	Login	Auth	User logged in: Kerolos Maged	نجح	::1	\N	\N	2026-02-22 01:30:23.174
453ac707-5f3f-4d6e-b58f-4d77a05ed5de	Admin User	Admin	Status Change	Members	Changed status of member Kerolos to suspended	نجح	::1	{"oldStatus": "suspended"}	{"newStatus": "suspended"}	2026-02-22 01:31:58.405
7163d2e5-9ed6-476e-bc0a-7352234b3373	Admin User	admin	Register	Staff	Registered new staff member: zeyad alaa	نجح	::1	\N	{"email": "staff.01232423235898@helwan-club.local", "message": "Staff member registered successfully", "success": true, "staff_id": 39, "account_id": 216}	2026-02-22 02:21:22.369
f7e693ec-b078-4165-b5d6-570d4fc01f92	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-23 11:30:59.928
3683824d-040e-4666-b1a7-55e521fd31d0	Admin User	Admin	Update	Members	Updated member profile: Kerolos Maged	نجح	::1	{"id": 143, "phone": "01233333333", "photo": null, "gender": "male", "status": "suspended", "address": null, "birthdate": "2016-07-14", "account_id": 210, "created_at": "2026-02-21T21:21:51.842Z", "is_foreign": false, "updated_at": "2026-02-21T21:32:04.520Z", "national_id": "78913222222220", "nationality": "Egyptian", "last_name_ar": "ماجد", "last_name_en": "Maged", "first_name_ar": "عضو تابع", "first_name_en": "Kerolos", "health_status": null, "medical_report": null, "member_type_id": 3, "points_balance": 0, "national_id_back": null, "national_id_front": null}	{"id": 143, "phone": "01233333333", "photo": null, "gender": "male", "status": "suspended", "address": null, "birthdate": "2016-07-14T00:00:00.000Z", "account_id": 210, "created_at": "2026-02-21T21:21:51.842Z", "is_foreign": false, "updated_at": "2026-02-21T21:32:56.134Z", "national_id": "78913222222220", "nationality": "Egyptian", "last_name_ar": "تابع", "last_name_en": "Maged", "first_name_ar": "عضو", "first_name_en": "Kerolos", "health_status": null, "medical_report": null, "member_type_id": 3, "points_balance": 0, "national_id_back": null, "national_id_front": null}	2026-02-22 01:32:48.975
1f8028a7-8daa-41b2-991f-020515bdff2d	Kerolos Maged	Foreigner Member	Login	Auth	User logged in: Kerolos Maged	نجح	::1	\N	\N	2026-02-22 01:36:46.3
da2ca6f3-6242-4d92-a5db-12d29e5003e3	Admin User	Admin	Status Change	Members	Changed status of member Kerolos to cancelled	نجح	::1	{"oldStatus": "cancelled"}	{"newStatus": "cancelled"}	2026-02-22 01:37:12.678
ed3f6320-153f-45db-b392-6db2a3ea2abf	Admin User	Admin	Approve	Members	Approved membership request for: Kerolos Maged	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-22 01:37:22.811
5e5c3bbe-004a-42f7-9951-7b38b2185838	Kerolos Maged	Foreigner Member	Login	Auth	User logged in: Kerolos Maged	نجح	::1	\N	\N	2026-02-22 01:38:05.563
196e1332-a1b9-4da5-aa37-a885bc0449df	Admin User	Admin	Update	Members	Updated member profile: Kerolos Maged	نجح	::1	{"id": 144, "phone": "01234565555", "photo": "uploads\\\\personal_photo-1771716958065-160634575.jpg", "gender": "male", "status": "active", "address": "helwan", "birthdate": "2009-06-09", "account_id": 211, "created_at": "2026-02-21T21:36:05.146Z", "is_foreign": true, "updated_at": "2026-02-21T21:37:29.832Z", "national_id": "12354657988888888888", "nationality": "Foreigner", "last_name_ar": "Maged", "last_name_en": "Maged", "first_name_ar": "اجنبى", "first_name_en": "Kerolos", "health_status": null, "medical_report": "uploads\\\\medical_report-1771716958097-804949194.jpg", "member_type_id": 12, "points_balance": 0, "national_id_back": null, "national_id_front": "uploads\\\\passport_photo-1771716958076-653233800.jpg"}	{"id": 144, "phone": "01234565555", "photo": "uploads\\\\personal_photo-1771716958065-160634575.jpg", "gender": "male", "status": "active", "address": "helwan", "birthdate": "2009-06-09T00:00:00.000Z", "account_id": 211, "created_at": "2026-02-21T21:36:05.146Z", "is_foreign": true, "updated_at": "2026-02-21T21:39:18.768Z", "national_id": "12354657988888888888", "nationality": "Foreigner", "last_name_ar": "zeyad", "last_name_en": "Maged", "first_name_ar": "اجنبى", "first_name_en": "Kerolos", "health_status": null, "medical_report": "uploads\\\\medical_report-1771716958097-804949194.jpg", "member_type_id": 12, "points_balance": 0, "national_id_back": null, "national_id_front": "uploads\\\\passport_photo-1771716958076-653233800.jpg"}	2026-02-22 01:39:11.55
ed817d59-5c14-4e6e-bea4-3ba377109ae6	Admin User	Admin	Approve	Members	Approved membership request for: Kerolos Maged	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-22 01:42:59.299
c729e70b-96eb-4f70-93d2-dbd6b59c0b50	Kerolos Maged	Visitor Member	Login	Auth	User logged in: Kerolos Maged	نجح	::1	\N	\N	2026-02-22 01:43:17.207
e8dea8af-8603-4386-87f9-e4508a661352	Admin User	Admin	Update	Members	Updated member profile: Kerolos Maged	نجح	::1	{"id": 145, "phone": "01235555555", "photo": "uploads\\\\personal_photo-1771717338494-120281395.jpg", "gender": "male", "status": "active", "address": "helwan", "birthdate": "2020-01-28", "account_id": 212, "created_at": "2026-02-21T21:42:25.614Z", "is_foreign": false, "updated_at": "2026-02-21T21:43:06.321Z", "national_id": "78985452322222", "nationality": "Egyptian", "last_name_ar": "Maged", "last_name_en": "Maged", "first_name_ar": "vistor", "first_name_en": "Kerolos", "health_status": null, "medical_report": "uploads\\\\medical_report-1771717338521-389309813.jpg", "member_type_id": 4, "points_balance": 0, "national_id_back": "uploads\\\\national_id_back-1771717338513-555821190.jpg", "national_id_front": "uploads\\\\national_id_front-1771717338504-519145766.jpg"}	{"id": 145, "phone": "01235555555", "photo": "uploads\\\\personal_photo-1771717338494-120281395.jpg", "gender": "male", "status": "active", "address": "helwan", "birthdate": "2020-01-28T00:00:00.000Z", "account_id": 212, "created_at": "2026-02-21T21:42:25.614Z", "is_foreign": false, "updated_at": "2026-02-21T21:44:03.919Z", "national_id": "78985452322222", "nationality": "Egyptian", "last_name_ar": "1", "last_name_en": "Maged", "first_name_ar": "vistor", "first_name_en": "Kerolos", "health_status": null, "medical_report": "uploads\\\\medical_report-1771717338521-389309813.jpg", "member_type_id": 4, "points_balance": 0, "national_id_back": "uploads\\\\national_id_back-1771717338513-555821190.jpg", "national_id_front": "uploads\\\\national_id_front-1771717338504-519145766.jpg"}	2026-02-22 01:43:56.68
6d486bdb-9030-4e6c-b8e3-392b357b4d3d	Kerolos ddvd	Team Member	Login	Auth	User logged in: Kerolos ddvd	نجح	::1	\N	\N	2026-02-22 01:49:40.914
dade78dc-1510-4b62-93f6-8739f5b38367	Mohamed Hossam	Founder Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-22 01:54:37.856
569b1a2b-a185-4463-83e6-d5d72654b45d	Mohammed Ahmed	Team Member	Login	Auth	User logged in: Mohammed Ahmed	نجح	::1	\N	\N	2026-02-22 01:53:59.602
f55cc041-fd21-4a38-bc30-b3cc049246fb	Ahmed Ahmed	Team Member	Login	Auth	User logged in: Ahmed Ahmed	نجح	::1	\N	\N	2026-02-22 01:58:02.296
2ca67211-5de6-4efd-bf46-1d25cd23e207	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-22 01:58:18.795
39e492bd-9573-4368-867a-35507216921a	Ahmed Ahmed	Team Member	Login	Auth	User logged in: Ahmed Ahmed	نجح	::1	\N	\N	2026-02-22 01:58:51.447
b53ce43b-841d-47c6-b981-d79293af8bc8	Ahmed Ahmed	Team Member	Login	Auth	User logged in: Ahmed Ahmed	نجح	::1	\N	\N	2026-02-22 02:05:04.15
c55d7b02-771c-4445-beb3-45fa064f6e92	Ahmed Ahmed	Team Member	Login	Auth	User logged in: Ahmed Ahmed	نجح	::1	\N	\N	2026-02-22 02:05:53.378
8f7291ef-ce36-40fd-b39e-4a21dd50a273	Mohamed Hossam	Founder Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-22 02:10:12.193
c5e3d2d8-996f-40c7-97f3-d5e974fabdf6	Ahmed Ahmed	Team Member	Login	Auth	User logged in: Ahmed Ahmed	نجح	::1	\N	\N	2026-02-22 02:13:59.824
4213e9f3-8432-4d59-bc7c-0bbd8a01931f	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-22 02:18:12.133
89a9b36c-07c2-48e3-bab7-1930d3349d36	Mohammed Omar	Team Member	Login	Auth	User logged in: Mohammed Omar	نجح	::1	\N	\N	2026-02-22 02:18:43.25
1b3d4de6-1461-4240-bad2-e67e6fae2562	Mohammed Omar	Team Member	Login	Auth	User logged in: Mohammed Omar	نجح	::1	\N	\N	2026-02-22 02:18:55.065
34328c3a-4080-4266-8b8d-fe6118edab14	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-22 02:19:04.35
50d475a2-fbf6-4a52-b227-5cac138b953c	Mohammed Omar	Team Member	Login	Auth	User logged in: Mohammed Omar	نجح	::1	\N	\N	2026-02-22 02:19:29.566
9fbb734a-ebda-4047-af9c-1614c1749702	Mohammed Omar	Team Member	Login	Auth	User logged in: Mohammed Omar	نجح	::1	\N	\N	2026-02-22 02:20:32.989
2483aa84-b950-414c-8769-914d3211fe6d	Admin User	admin	Assign Packages	Staff	Assigned privilege packages to staff ID: 39	نجح	::1	\N	{"package_ids": [5]}	2026-02-22 02:21:24.697
59d893af-52ab-42ff-a73d-2b03bb6cbee4	zeyad alaa	Executive Director	Login	Auth	User logged in: zeyad alaa	نجح	::1	\N	\N	2026-02-22 02:22:35.561
f084c716-4243-4b74-a076-de72d94a3d07	zeyad alaa	Executive Director	Change Credentials	Auth	User changed credentials: zeyad alaa	نجح	::1	\N	\N	2026-02-22 02:23:16.945
17f51291-5905-4c3b-9237-0a7e2e4d648a	zeyad alaa	Executive Director	Login	Auth	User logged in: zeyad alaa	نجح	::1	\N	\N	2026-02-22 02:25:22.257
f058d9bc-5fcd-4202-aa6a-c25cefc716dc	zeyad alaa	Executive Director	Approve	Members	Approved membership request for: Kerolos Maged	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-22 02:25:32.291
60144923-a893-4154-a811-16f2e14bb45f	zeyad alaa	Executive Director	Status Change	Members	Changed status of member Kerolos to suspended	نجح	::1	{"oldStatus": "suspended"}	{"newStatus": "suspended"}	2026-02-22 02:25:48.357
539453c5-78a6-41dc-b23a-76bdaaeacc30	Admin User	admin	Update	Staff	Updated staff member ID: 39	نجح	::1	\N	{"phone": "01233333333", "address": "حلوان", "last_name_ar": "علاء", "last_name_en": "alaa", "first_name_ar": "زيادد", "first_name_en": "zeyad"}	2026-02-22 02:27:30.998
4ce385ec-f20f-4f0c-beb4-c009bc57a6dc	Admin User	admin	Create Package	Staff	Created privilege package: LJFIHIH	نجح	::1	\N	{"id": 8, "code": "LJFIHIH", "name_ar": "ljfihih", "name_en": "ljfihih", "is_active": true, "created_at": "2026-02-21T22:28:39.194Z", "updated_at": "2026-02-21T22:28:39.194Z", "description_ar": null, "description_en": null, "privileges_count": 33}	2026-02-22 02:28:34.787
7e24bef8-acd1-4656-bed6-13488f132334	Admin User	admin	Assign Packages	Staff	Assigned privilege packages to staff ID: 39	نجح	::1	\N	{"package_ids": [5, 4]}	2026-02-22 02:30:08.207
21493aa4-8fa2-4337-b3d5-2866b61c27e4	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-22 05:54:36.109
4ece239e-f09c-43d4-a4d5-20df84f14053	Admin User	Admin	Create	MediaGallery	Created media post: الحياه حلوه	نجح	::1	\N	{"id": 7, "date": "2026-02-22T04:36:14.608Z", "title": "الحياه حلوه", "images": ["/uploads/images-1771734974605-752171960.png"], "category": "صور", "videoUrl": "", "created_at": "2026-02-22T02:36:16.252Z", "updated_at": "2026-02-22T02:36:16.252Z", "description": "حبوا بعض", "videoDuration": null}	2026-02-22 06:36:16.314
6d86d93f-a033-4772-bfc5-a4822907fa6d	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-22 06:36:34.996
2c5b0467-9e87-407b-b9e2-35ac9044acae	Admin User	Admin	Status Change	Members	Changed status of member mohammed to active	نجح	::1	{"oldStatus": "active"}	{"newStatus": "active"}	2026-02-22 06:38:14.319
80afaf78-919b-40c2-b2b2-b2cbe85dbe30	Admin User	admin	Deactivate	Staff	Deactivated staff member ID: 27	نجح	::1	\N	{"status": "inactive", "is_active": false}	2026-02-22 06:40:42.479
0a41ff9e-3639-4936-b149-05679dfa20bc	Admin User	admin	Create Package	Staff	Created privilege package: PKG_1771735341359	نجح	::1	\N	{"id": 9, "code": "PKG_1771735341359", "name_ar": "باقه مدير كبير جداً", "name_en": "باقه مدير كبير جداً", "is_active": true, "created_at": "2026-02-22T02:42:23.197Z", "updated_at": "2026-02-22T02:42:23.197Z", "description_ar": null, "description_en": null, "privileges_count": 11}	2026-02-22 06:42:24.641
a700b115-a38a-4498-bc10-fbaee5b3dc5e	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-22 07:27:46.214
afbf3020-874c-4d34-b8ea-9df53e80d0c7	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-22 17:17:00.022
0c37b326-a839-4fb6-9072-3489787911ea	Admin User	Admin	Create	Sports	Created sport: This Test Sport (رياضه محليه)	نجح	0.0.0.0	\N	{"id": 11, "price": 4000, "status": "active", "name_ar": "رياضه محليه", "name_en": "This Test Sport", "is_active": true, "created_at": "2026-02-22T13:17:38.637Z", "updated_at": "2026-02-22T13:17:38.637Z", "approved_at": "2026-02-22T15:17:38.722Z", "sport_image": null, "description_ar": null, "description_en": null, "max_participants": 0, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	2026-02-22 17:17:38.943
99d7b19a-227d-4b6a-8df5-af40b22305ed	Admin User	Admin	Create	Sports	Created sport: This is not a sports (هذه ليست رياضه)	نجح	0.0.0.0	\N	{"id": 12, "price": 20, "status": "active", "name_ar": "هذه ليست رياضه", "name_en": "This is not a sports", "is_active": true, "created_at": "2026-02-22T13:19:00.426Z", "updated_at": "2026-02-22T13:19:00.426Z", "approved_at": "2026-02-22T15:19:00.516Z", "sport_image": null, "description_ar": null, "description_en": null, "max_participants": 0, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	2026-02-22 17:19:00.939
b56baf90-1d9d-4098-ae10-1f2da887d88e	Admin User	Admin	Delete	Sports	Deleted sport: This is not a sports (هذه ليست رياضه)	نجح	0.0.0.0	{"price": "20.00", "status": "active", "name_ar": "هذه ليست رياضه", "name_en": "This is not a sports", "is_active": true, "created_at": "2026-02-22T13:19:00.426Z", "updated_at": "2026-02-22T13:19:00.426Z", "approved_at": "2026-02-22T15:19:00.516Z", "sport_image": null, "description_ar": null, "description_en": null, "max_participants": 0, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	\N	2026-02-22 17:20:41.237
4f463e08-20ae-4d38-adc7-3db249b69b00	Admin User	Admin	Delete	Sports	Deleted sport: This Test Sport (رياضه محليه)	نجح	0.0.0.0	{"price": "4000.00", "status": "active", "name_ar": "رياضه محليه", "name_en": "This Test Sport", "is_active": true, "created_at": "2026-02-22T13:17:38.637Z", "updated_at": "2026-02-22T13:17:38.637Z", "approved_at": "2026-02-22T15:17:38.722Z", "sport_image": null, "description_ar": null, "description_en": null, "max_participants": 0, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	\N	2026-02-22 17:20:43.512
71359100-f211-430e-af7a-ab7f1c347773	Admin User	Admin	Status Change	Members	Changed status of member daw to active	نجح	::1	{"oldStatus": "active"}	{"newStatus": "active"}	2026-02-22 22:03:57.9
13ac4a03-f2da-4bb0-8e98-de52777e5817	Admin User	Admin	Status Change	Members	Changed status of member Staff memeber to active	نجح	::1	{"oldStatus": "active"}	{"newStatus": "active"}	2026-02-22 22:10:58.966
fe912261-1d20-41eb-a673-df21ca4339c7	Admin User	Admin	Status Change	Members	Changed status of member dada to active	نجح	::1	{"oldStatus": "active"}	{"newStatus": "active"}	2026-02-22 22:13:27.003
f01d7f3c-23a4-4965-8413-3e8f98be19fa	Admin User	Admin	Update	Sports	Updated sport: Swimmm	نجح	0.0.0.0	{"id": 6, "price": "12345.00", "status": "active", "name_ar": "Swimming", "name_en": "Swimming", "is_active": true, "created_at": "2026-02-15T20:56:34.678Z", "updated_at": "2026-02-15T20:56:34.678Z", "approved_at": "2026-02-15T22:56:34.047Z", "sport_image": null, "description_ar": null, "description_en": null, "max_participants": 0, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	{"id": 6, "price": 12345, "status": "active", "name_ar": "سباحة", "name_en": "Swimmm", "is_active": true, "created_at": "2026-02-15T20:56:34.678Z", "updated_at": "2026-02-22T18:19:27.027Z", "approved_at": "2026-02-15T22:56:34.047Z", "sport_image": null, "description_ar": null, "description_en": null, "max_participants": 0, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	2026-02-22 22:19:27.238
a1f472b8-62b3-45a4-9c86-d9c336dedfe0	Admin User	admin	Update	Staff	Updated staff member ID: 1	نجح	::1	\N	{"phone": "0123456789", "address": "Cairo"}	2026-02-22 22:28:40.66
517fba71-e883-4c6e-8a28-2eb3a21a003a	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-22 23:31:33.299
99369439-8667-496b-a79f-882522328aff	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-22 23:53:37.961
e48f6527-05af-4ae2-b6cc-b0bdad3009ad	Mohamed Salem	Founder Member	Login	Auth	User logged in: Mohamed Salem	نجح	::1	\N	\N	2026-02-23 00:18:27.684
1ca1bc1d-4480-4a56-8dd8-86b6fe6ae7bf	Mohamed Hossam	Founder Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-23 00:18:56.269
08198f99-ac21-493b-8a00-ab4bfd657a72	Admin User	admin	Register	Staff	Registered new staff member: Trying privg trying	نجح	::1	\N	{"email": "staff.12222222111111@helwan-club.local", "message": "Staff member registered successfully", "success": true, "staff_id": 41, "account_id": 222}	2026-02-23 00:37:31.206
9d2c13af-cd4a-4d10-85fd-bcbbf8126515	Admin User	admin	Assign Packages	Staff	Assigned privilege packages to staff ID: 41	نجح	::1	\N	{"package_ids": [5]}	2026-02-23 00:37:32.355
66bd3ef3-9dad-4d53-8199-03a26c24b647	Trying privg trying	Deputy Executive Director	Login	Auth	User logged in: Trying privg trying	نجح	::1	\N	\N	2026-02-23 00:37:38.937
d698cdec-7aee-4c70-86e9-b5702a38c4f4	Trying privg trying	Deputy Executive Director	Change Credentials	Auth	User changed credentials: Trying privg trying	نجح	::1	\N	\N	2026-02-23 00:37:56.801
6751205d-0a51-430c-93c5-afdf7b6edb2f	Trying privg trying	Deputy Executive Director	Login	Auth	User logged in: Trying privg trying	نجح	::1	\N	\N	2026-02-23 00:38:02.166
be1c7785-665e-4eaf-ae9a-55ef586fec62	Admin User	admin	Register	Staff	Registered new staff member: Less staff Less	نجح	::1	\N	{"email": "staff.12413111111111@helwan-club.local", "message": "Staff member registered successfully", "success": true, "staff_id": 42, "account_id": 223}	2026-02-23 00:58:45.295
df7e8f2a-5fbc-4d83-8ddb-4fcd1c56dcd5	Admin User	admin	Assign Packages	Staff	Assigned privilege packages to staff ID: 42	نجح	::1	\N	{"package_ids": [1]}	2026-02-23 00:58:47.679
2ad500f0-7f0e-4843-8377-ba839c6096c9	Less staff Less	Sports Activity Specialist	Login	Auth	User logged in: Less staff Less	نجح	::1	\N	\N	2026-02-23 00:59:41.342
713f060e-8180-4bbf-83aa-1e04f4ee8727	Less staff Less	Sports Activity Specialist	Change Credentials	Auth	User changed credentials: Less staff Less	نجح	::1	\N	\N	2026-02-23 00:59:50.952
d0519ba5-7e82-4cd5-a13e-5c2e98c89ca6	Less staff Less	Sports Activity Specialist	Login	Auth	User logged in: Less staff Less	نجح	::1	\N	\N	2026-02-23 00:59:56.058
055d62ab-5865-4ed3-92c6-a8c966bde8a6	Admin User	Admin	Create	MediaGallery	Created media post: الحياة مكنتش حلوه امبارح	نجح	::1	\N	{"id": 8, "date": "2026-02-22T23:10:37.604Z", "title": "الحياة مكنتش حلوه امبارح", "images": ["/uploads/images-1771801837599-240490286.png"], "category": "صور", "videoUrl": "", "created_at": "2026-02-22T21:10:39.228Z", "updated_at": "2026-02-22T21:10:39.228Z", "description": "يارب الحياه تبقى حلوه بكره", "videoDuration": null}	2026-02-23 01:10:39.69
462ec272-7f79-4624-a9bd-ea7b01f049de	Admin User	Admin	Update	Members	Updated member profile: Kerolos Maged	نجح	::1	{"id": 142, "phone": "01233333333", "photo": null, "gender": "male", "status": "active", "address": null, "birthdate": "2016-07-14", "account_id": 209, "created_at": "2026-02-21T21:21:03.692Z", "is_foreign": false, "updated_at": "2026-02-21T22:25:39.865Z", "national_id": "78913222222222", "nationality": "Egyptian", "last_name_ar": "Maged", "last_name_en": "Maged", "first_name_ar": "عضو تابع", "first_name_en": "Kerolos", "health_status": null, "medical_report": null, "member_type_id": 3, "points_balance": 0, "national_id_back": null, "national_id_front": null}	{"id": 142, "phone": "01233333333", "photo": null, "gender": "male", "status": "active", "address": null, "birthdate": "2016-07-14T00:00:00.000Z", "account_id": 209, "created_at": "2026-02-21T21:21:03.692Z", "is_foreign": false, "updated_at": "2026-02-22T21:26:05.652Z", "national_id": "78913222222222", "nationality": "Egyptian", "last_name_ar": "Kero", "last_name_en": "Maged", "first_name_ar": "عضو تابع", "first_name_en": "Kerolos", "health_status": null, "medical_report": null, "member_type_id": 3, "points_balance": 0, "national_id_back": null, "national_id_front": null}	2026-02-23 01:26:06.251
dad55f9a-3087-42a3-b02c-bfa4731dbf9c	Admin User	admin	Register	Staff	Registered new staff member: YaraStaff Stafff	نجح	::1	\N	{"email": "staff.41231241241241@helwan-club.local", "message": "Staff member registered successfully", "success": true, "staff_id": 43, "account_id": 224}	2026-02-23 01:33:48.47
9b02cf7f-6160-4723-87af-af88832a6bf4	Admin User	admin	Assign Packages	Staff	Assigned privilege packages to staff ID: 43	نجح	::1	\N	{"package_ids": [1]}	2026-02-23 01:33:50.618
b06f4938-00e8-4938-8742-6d57e31a6274	YaraStaff Stafff	Sports Activity Specialist	Login	Auth	User logged in: YaraStaff Stafff	نجح	::1	\N	\N	2026-02-23 01:34:05.019
fd2c2d90-fd39-4c68-a0ec-00fb1b2a1a62	YaraStaff Stafff	Sports Activity Specialist	Change Credentials	Auth	User changed credentials: YaraStaff Stafff	نجح	::1	\N	\N	2026-02-23 01:34:16.437
6bdc3045-2258-4d4c-97ca-f88ed0418536	YaraStaff Stafff	Sports Activity Specialist	Login	Auth	User logged in: YaraStaff Stafff	نجح	::1	\N	\N	2026-02-23 01:34:23.108
4dc0db0d-a012-4f4f-8b1e-84ea8297d4e9	Admin User	admin	Assign Packages	Staff	Assigned privilege packages to staff ID: 43	نجح	::1	\N	{"package_ids": [7]}	2026-02-23 01:35:16.355
74293b4e-97c6-463c-b746-220dc21b69cf	YaraStaff Stafff	Sports Activity Specialist	Login	Auth	User logged in: YaraStaff Stafff	نجح	::1	\N	\N	2026-02-23 01:35:39.709
e55802b1-b150-4d58-9793-adc4f154e94a	YaraStaff Stafff	Sports Activity Specialist	Login	Auth	User logged in: YaraStaff Stafff	نجح	::1	\N	\N	2026-02-23 01:49:56.466
9d46e1e4-4cc1-4ba2-a44a-31ea7ef9e988	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-23 02:26:20.031
380e7f79-fa72-47c6-90ff-dda679bdcd3a	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-23 03:59:37.796
d8a3c300-abc3-4e3d-b1bf-24cc5d0fd1d4	Admin User	Admin	Update	Members	Updated member profile: Staff player Staffffplayer	نجح	::1	{"id": 27, "phone": "01013133131", "photo": null, "gender": "male", "status": "active", "address": "dadwdar", "birthdate": "2026-02-20", "account_id": 30, "created_at": "2026-02-01T00:27:16.202Z", "is_foreign": false, "updated_at": "2026-02-01T00:27:16.726Z", "national_id": "12412312412412", "nationality": "Egyptian", "last_name_ar": "adad", "last_name_en": "adad", "first_name_ar": "dad", "first_name_en": "dada", "health_status": null, "medical_report": null, "member_type_id": 1, "points_balance": 0, "national_id_back": null, "national_id_front": null}	{"id": 27, "phone": "01026165849", "photo": null, "gender": "male", "status": "active", "address": "dadwdar", "birthdate": "2026-02-20", "account_id": 30, "created_at": "2026-02-01T00:27:16.202Z", "is_foreign": false, "updated_at": "2026-02-23T01:34:18.390Z", "national_id": "12412312412412", "nationality": "Egyptian", "last_name_ar": "لاعب ستاف", "last_name_en": "Staffffplayer", "first_name_ar": "لاعب ستف", "first_name_en": "Staff player", "health_status": null, "medical_report": null, "member_type_id": 1, "points_balance": 0, "national_id_back": null, "national_id_front": null}	2026-02-23 05:34:19.339
e2cd1ea4-bbfc-4c5e-be29-32586fcd8f61	Mt aaaaaaa	Team Member	Login	Auth	User logged in: Mt aaaaaaa	نجح	::1	\N	\N	2026-02-23 11:06:55.581
e32a4a45-efb2-4878-94a3-48632d974082	Admin User	Admin	Update	Members	Updated member profile: Staff player Staffffplayertwo	نجح	::1	{"id": 27, "phone": "01026165849", "photo": null, "gender": "male", "status": "active", "address": "dadwdar", "birthdate": "2026-02-20", "account_id": 30, "created_at": "2026-02-01T00:27:16.202Z", "is_foreign": false, "updated_at": "2026-02-23T01:34:18.390Z", "national_id": "12412312412412", "nationality": "Egyptian", "last_name_ar": "لاعب ستاف", "last_name_en": "Staffffplayer", "first_name_ar": "لاعب ستف", "first_name_en": "Staff player", "health_status": null, "medical_report": null, "member_type_id": 1, "points_balance": 0, "national_id_back": null, "national_id_front": null}	{"id": 27, "phone": "01026165849", "photo": null, "gender": "male", "status": "active", "address": "dadwdar", "birthdate": "2026-02-20", "account_id": 30, "created_at": "2026-02-01T00:27:16.202Z", "is_foreign": false, "updated_at": "2026-02-23T01:35:48.069Z", "national_id": "12412312412412", "nationality": "Egyptian", "last_name_ar": "لاعب ستاف", "last_name_en": "Staffffplayertwo", "first_name_ar": "لاعب ستاف", "first_name_en": "Staff player", "health_status": null, "medical_report": null, "member_type_id": 1, "points_balance": 0, "national_id_back": null, "national_id_front": null}	2026-02-23 05:35:48.073
a049058a-6b08-4db7-8798-61a25801f2a5	Admin User	Admin	Update	Members	Updated member profile: mohammed heshams staff	نجح	::1	{"id": 146, "phone": "01013213216", "photo": "uploads\\\\personal_photo-1771733218244-588018338.png", "gender": "male", "status": "active", "address": "Staff", "birthdate": "2026-02-11", "account_id": 217, "created_at": "2026-02-22T02:06:58.250Z", "is_foreign": false, "updated_at": "2026-02-22T02:38:13.084Z", "national_id": "12314444444444", "nationality": "Egyptian", "last_name_ar": "هشام", "last_name_en": "heshams staff", "first_name_ar": "محمد", "first_name_en": "mohammed", "health_status": null, "medical_report": "uploads\\\\medical_report-1771733218294-282355816.png", "member_type_id": 2, "points_balance": 0, "national_id_back": "uploads\\\\national_id_back-1771733218275-228942606.png", "national_id_front": "uploads\\\\national_id_front-1771733218266-416378344.png"}	{"id": 146, "phone": "01013213216", "photo": "uploads\\\\personal_photo-1771733218244-588018338.png", "gender": "male", "status": "active", "address": "Staff", "birthdate": "2026-02-11T00:00:00.000Z", "account_id": 217, "created_at": "2026-02-22T02:06:58.250Z", "is_foreign": false, "updated_at": "2026-02-23T01:37:11.295Z", "national_id": "12314444444444", "nationality": "Egyptian", "last_name_ar": "هشامممممم", "last_name_en": "heshams staff", "first_name_ar": "محمد", "first_name_en": "mohammed", "health_status": null, "medical_report": "uploads\\\\medical_report-1771733218294-282355816.png", "member_type_id": 2, "points_balance": 0, "national_id_back": "uploads\\\\national_id_back-1771733218275-228942606.png", "national_id_front": "uploads\\\\national_id_front-1771733218266-416378344.png"}	2026-02-23 05:37:11.357
759c2799-1aed-46ac-ac96-cbecfb71ed2e	Admin User	Admin	Update	Sports	Updated sport: Basketball	نجح	0.0.0.0	{"id": 3, "price": "60.00", "status": "active", "name_ar": "سلة", "name_en": "Basketball", "is_active": true, "created_at": "2026-02-14T21:22:13.718Z", "updated_at": "2026-02-14T21:22:13.718Z", "approved_at": "2026-02-14T23:22:13.555Z", "sport_image": null, "description_ar": null, "description_en": null, "max_participants": 0, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	{"id": 3, "price": 60, "status": "active", "name_ar": "كرة سلة", "name_en": "Basketball", "is_active": true, "created_at": "2026-02-14T21:22:13.718Z", "updated_at": "2026-02-23T02:30:26.735Z", "approved_at": "2026-02-14T23:22:13.555Z", "sport_image": null, "description_ar": null, "description_en": null, "max_participants": 0, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	2026-02-23 06:30:26.309
70cf039a-7538-4439-8855-9484d15359f8	Mohamed Hossam	Founder Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-23 07:45:40.151
5f317438-d419-4fd3-83e7-220c53c333d7	Mohamed Hossam	Founder Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-23 08:04:18.477
f98fbc70-a0cf-4e96-bb96-9cba42105169	Yara Ahmed	Founder Member	Login	Auth	User logged in: Yara Ahmed	نجح	::1	\N	\N	2026-02-23 08:23:06.55
2c1dfea8-3c73-4ac2-8122-607203c4efec	Mohamed Hossam	Founder Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-23 08:25:31.291
b9546867-7be6-4427-9ded-8740c10d2017	Yara Ahmed	Founder Member	Login	Auth	User logged in: Yara Ahmed	نجح	::1	\N	\N	2026-02-23 08:26:38.604
449516ac-f750-4f00-8363-fd2e2369b3ec	Admin User	Admin	ASSIGN_MEMBER_SPORTS	Members	Assigned 5 sports to member ID 27	نجح	::1	\N	{"member_id": 27, "sport_ids": [6, 3, 8, 7, 10], "assigned_at": "2026-02-23T06:26:55.407Z", "member_name": "Staff player Staffffplayertwo"}	2026-02-23 08:26:55.934
cbda2aa4-711a-42d1-86cf-d7df55ab4e3a	Admin User	Admin	ASSIGN_MEMBER_SPORTS	Members	Assigned 5 sports to member ID 27	نجح	::1	\N	{"member_id": 27, "sport_ids": [6, 3, 8, 7, 10], "assigned_at": "2026-02-23T06:33:16.111Z", "member_name": "Staff player Staffffplayertwo"}	2026-02-23 08:33:16.604
6d0bce6c-a848-4016-88be-a11a9e000352	Mohamed Hossam	Founder Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-23 08:36:54.183
caae0679-9a1a-4a82-816e-daabb914d2fc	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-23 08:52:35.748
0d97dbc3-d75f-414a-982a-dde7c4796179	Admin User	Admin	ASSIGN_MEMBER_SPORTS	Members	Assigned 2 sports to member ID 147	نجح	::1	\N	{"member_id": 147, "sport_ids": [10, 8], "assigned_at": "2026-02-23T06:54:16.106Z", "member_name": "Staff memeber staff memeber"}	2026-02-23 08:54:16.524
f30af852-87a0-46b2-94cd-5840b203c3a1	Ahmed Ahmed	Team Member	Login	Auth	User logged in: Ahmed Ahmed	نجح	::1	\N	\N	2026-02-23 10:09:50.308
32aa76db-5039-475f-b951-66725036081e	Mohammed Omar	Team Member	Login	Auth	User logged in: Mohammed Omar	نجح	::1	\N	\N	2026-02-23 10:11:04.381
82cc16e7-ab9b-460a-b29c-a088fdf1c3dd	Ahmed AAAAA	Team Member	Login	Auth	User logged in: Ahmed AAAAA	نجح	::1	\N	\N	2026-02-23 10:15:39.583
0258d5a7-d19a-4462-bd00-2a8a1702d0d7	Ahmed AAAAA	Team Member	Login	Auth	User logged in: Ahmed AAAAA	نجح	::1	\N	\N	2026-02-23 10:15:58.252
9be8e2ab-5fe7-4244-bd23-e41e8d40778c	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-23 10:16:25.372
d93e70fa-b4de-4e5c-81ee-becdef6d1190	Ahmed AAAAA	Team Member	Login	Auth	User logged in: Ahmed AAAAA	نجح	::1	\N	\N	2026-02-23 10:17:28.289
4b983a37-7c8d-45e6-a217-607d0f3bd438	Ahmed AAAAA	Team Member	Login	Auth	User logged in: Ahmed AAAAA	نجح	::1	\N	\N	2026-02-23 10:37:51.8
9fa90f6c-a312-4f27-aea9-ae76a380132d	Mohammed aaaaaa	Team Member	Login	Auth	User logged in: Mohammed aaaaaa	نجح	::1	\N	\N	2026-02-23 10:40:34.568
bf947527-c601-455b-86dc-3be6b3220e27	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-23 10:40:51.858
b8013bee-5cc9-48a3-9f51-2e6e2db1400f	Mohammed aaaaaa	Team Member	Login	Auth	User logged in: Mohammed aaaaaa	نجح	::1	\N	\N	2026-02-23 10:41:10.677
5ff6ec4d-84a0-4a2a-8b01-d269a1b55447	Ahmed AAAAA	Team Member	Login	Auth	User logged in: Ahmed AAAAA	نجح	::1	\N	\N	2026-02-23 10:42:35.401
6aa38e09-913e-48da-af87-f98bd49cdc00	Mt aaaaaaa	Team Member	Login	Auth	User logged in: Mt aaaaaaa	نجح	::1	\N	\N	2026-02-23 11:05:56.322
d4a08ff6-885f-4a97-ad37-9bfc8cde0556	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-23 11:06:09.933
380c0213-efaa-45d9-868e-a53e8f56abb1	mt mt	Team Member	Login	Auth	User logged in: mt mt	نجح	::1	\N	\N	2026-02-23 11:32:14.26
663a9a72-b32d-419e-8c15-81585123adf5	mt mt	Team Member	Login	Auth	User logged in: mt mt	نجح	::1	\N	\N	2026-02-23 11:40:14.172
468e57d6-6fd8-447d-ac26-e406aee76ce2	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-23 11:43:17.363
2172df76-23f8-4816-8c03-2624837d2349	Ahmed Mohammed	Team Member	Login	Auth	User logged in: Ahmed Mohammed	نجح	::1	\N	\N	2026-02-23 11:43:52.644
58b9e94b-c1fd-4230-bc83-85f827a8c9ab	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-23 11:49:01.987
390b4ff8-65cd-4b4e-af1a-a233ea552595	Aaaa Aaaa	Team Member	Login	Auth	User logged in: Aaaa Aaaa	نجح	::1	\N	\N	2026-02-23 11:49:29.733
fec2530d-d2a5-443f-84a8-5a1fae437bce	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-23 23:06:38.927
43769f6f-bfcb-4a32-91fd-91d571576799	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-24 01:15:29.713
dbe6de0b-e004-416d-a13f-1dee456b3cc7	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-24 01:53:25.087
e37522dc-ca46-4ff9-98bf-31041e589484	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-24 01:53:40.835
38f581c4-38b1-46c2-b9e9-3a89ab4b1785	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-24 01:54:42.799
5aea03f5-914e-4978-87ff-2a0afa29ccf6	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-24 02:25:30.423
699a1270-1479-430a-8d5c-0744ca739960	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-24 02:35:44.724
5f79b5de-b22b-4577-a02d-8ed9643f407e	testingnignign sjeoiawjeiawe	Working Member	Login	Auth	User logged in: testingnignign sjeoiawjeiawe	نجح	::1	\N	\N	2026-02-24 02:53:23.352
67abf198-721f-4614-ac93-b5189bffa3f5	testingnignign sjeoiawjeiawe	Working Member	Login	Auth	User logged in: testingnignign sjeoiawjeiawe	نجح	::1	\N	\N	2026-02-24 05:14:48.98
20f70b85-d722-490a-ac94-7545531f7349	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-24 05:15:40.888
549922fd-e904-4400-90b5-87716a773555	Admin User	Admin	Update	Sports	Updated sport: Swimmm	نجح	0.0.0.0	{"id": 6, "price": "12345.00", "status": "active", "name_ar": "سباحة", "name_en": "Swimmm", "is_active": true, "created_at": "2026-02-15T20:56:34.678Z", "updated_at": "2026-02-22T18:19:27.027Z", "approved_at": "2026-02-15T22:56:34.047Z", "sport_image": null, "description_ar": null, "description_en": null, "max_participants": 0, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	{"id": 6, "price": 12345, "status": "active", "name_ar": "سباح", "name_en": "Swimmm", "is_active": true, "created_at": "2026-02-15T20:56:34.678Z", "updated_at": "2026-02-24T01:16:30.288Z", "approved_at": "2026-02-15T22:56:34.047Z", "sport_image": null, "description_ar": null, "description_en": null, "max_participants": 0, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	2026-02-24 05:16:30.149
5bc811f5-878e-4e31-b2a2-f7c80064ead1	Admin User	Admin	Approve	Members	Approved membership request for: testingnignign sjeoiawjeiawe	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-24 05:17:01.547
b4f2b8d9-43e5-4b43-8588-420aa486dab1	testingnignign sjeoiawjeiawe	Working Member	Login	Auth	User logged in: testingnignign sjeoiawjeiawe	نجح	::1	\N	\N	2026-02-24 05:18:30.269
82623764-2156-42c6-a2a4-16b7f8c38189	Mohamed Hossam	Founder Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-24 05:55:20.959
7badeb5a-4659-4a8c-9d30-ecdf025b8714	Yara Ahmed	Founder Member	Login	Auth	User logged in: Yara Ahmed	نجح	::1	\N	\N	2026-02-24 05:57:55.02
803cf7a1-31b4-4ef0-ad9d-59580f05e1ec	Yara Ahmed	Founder Member	Login	Auth	User logged in: Yara Ahmed	نجح	::1	\N	\N	2026-02-24 06:40:24.199
7861b0e1-5401-43bf-8a6c-a78a9175b3a9	Mohamed Hossam	Founder Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-24 06:43:31.725
b6ca954c-c302-4173-a967-ec8da0d48b8a	Mohamed Salem	Founder Member	Login	Auth	User logged in: Mohamed Salem	نجح	::1	\N	\N	2026-02-24 06:46:58.773
f5f77988-4752-4a53-b03b-ec052f3df176	Mohamed Salem	Founder Member	Login	Auth	User logged in: Mohamed Salem	نجح	::1	\N	\N	2026-02-24 06:50:34.241
ba5a4cdc-3a07-41ef-a329-28e7aa92016d	Mohamed Salem	Founder Member	Login	Auth	User logged in: Mohamed Salem	نجح	::1	\N	\N	2026-02-24 07:17:34.155
e072e78d-7fa0-42f5-974e-cf4732a2404b	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-24 14:30:20.115
cd36ae60-6364-47b4-97e4-f461ad29af67	Zeyad Alaa Eldin Gad	Working Member	Login	Auth	User logged in: Zeyad Alaa Eldin Gad	نجح	::1	\N	\N	2026-02-24 14:34:32.932
288d4b4e-2cd9-45f3-90a5-d9022fdeadca	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-24 14:35:00.209
07c1e038-7008-4c36-9a60-20af9bc1e13a	Admin User	Admin	Approve	Members	Approved membership request for: Zeyad Alaa Eldin Gad	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-24 14:35:16.975
c9282b37-0b5e-4e78-b2e9-a3aed01a787b	Zeyad Alaa Eldin Gad	Working Member	Login	Auth	User logged in: Zeyad Alaa Eldin Gad	نجح	::1	\N	\N	2026-02-24 14:35:26.292
161cc60b-d5b1-422a-8da2-7ccee8970d08	RRRRR RRRRR	Founder Member	Login	Auth	User logged in: RRRRR RRRRR	نجح	::1	\N	\N	2026-02-24 14:38:00.524
99920477-c6b8-4ce5-9e56-a25f5d427378	Aaaa Aaaa	Team Member	Login	Auth	User logged in: Aaaa Aaaa	نجح	::1	\N	\N	2026-02-24 14:42:50.254
8d4652c9-22d4-4fcc-95c9-967ed162ceaf	Zeyad Alaa Eldin Gad	Working Member	Login	Auth	User logged in: Zeyad Alaa Eldin Gad	نجح	::1	\N	\N	2026-02-24 14:43:25.908
8c8f64a1-97c2-4561-acdb-964e38c97180	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-24 15:17:25.892
a60a5f15-3f38-4988-970f-c905d4b79b68	admin@club.com	admin	Update	MembershipPlans	Updated membership plan: Founder Member	نجح	::1	{"id": 16, "price": 200, "max_age": null, "min_age": null, "name_ar": "العضو المؤسس", "name_en": "Founder Member", "currency": "EGP", "is_active": true, "plan_code": "FOUNDER", "created_at": "2026-01-24T13:50:34.451Z", "updated_at": "2026-02-21T20:06:48.980Z", "renewal_price": 50, "description_ar": null, "description_en": "Founding member - lifetime privileges", "is_installable": false, "member_type_id": 1, "duration_months": 13, "is_for_foreigner": false, "max_installments": null}	{"id": 16, "price": 200, "max_age": null, "min_age": null, "name_ar": "العضو المؤسس", "name_en": "Founder Member", "currency": "EGP", "is_active": true, "plan_code": "FOUNDER", "created_at": "2026-01-24T13:50:34.451Z", "updated_at": "2026-02-24T11:18:33.378Z", "renewal_price": 50, "description_ar": null, "description_en": "Founding member - lifetime privileges", "is_installable": false, "member_type_id": 1, "duration_months": 13, "is_for_foreigner": false, "max_installments": null}	2026-02-24 15:18:32.609
533a48ca-e3a8-47cc-92e7-d06f95b9bd3b	Admin User	Admin	Approve	Members	Approved membership request for: kerolos maged	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-24 15:32:32.596
8ca226a0-31d2-4fb6-b2d7-1580421da482	Mohamed Salem	Founder Member	Login	Auth	User logged in: Mohamed Salem	نجح	::1	\N	\N	2026-02-24 16:34:43.188
4d315963-f37a-47d2-8ebd-328d8af3ade0	Yara Ahmed	Founder Member	Login	Auth	User logged in: Yara Ahmed	نجح	::1	\N	\N	2026-02-24 16:36:09.419
6b9a028e-5046-4caa-905f-b8a1ae291efc	Mohamed Salem	Founder Member	Login	Auth	User logged in: Mohamed Salem	نجح	::1	\N	\N	2026-02-24 16:38:21.491
a01e9cc4-c6a7-4b34-bacf-91d9eab226cf	Mohamed Salem	Founder Member	Login	Auth	User logged in: Mohamed Salem	نجح	::1	\N	\N	2026-02-24 16:39:46.041
6944c052-0d9b-4e6d-8451-02092840c11c	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-24 16:40:27.521
19b9a9c8-5baa-41a9-a680-da383e252f2b	Admin User	Admin	Update	Members	Updated member profile: kerolos maged	نجح	::1	{"id": 152, "phone": "01233333333", "photo": null, "gender": "male", "status": "active", "address": null, "birthdate": "2004-07-23", "account_id": 235, "created_at": "2026-02-24T11:21:40.059Z", "is_foreign": false, "updated_at": "2026-02-24T11:32:31.793Z", "national_id": "12324232358598", "nationality": "Egyptian", "last_name_ar": "ماجد", "last_name_en": "maged", "first_name_ar": "كيرلس", "first_name_en": "kerolos", "health_status": null, "medical_report": null, "member_type_id": 13, "points_balance": 0, "national_id_back": null, "national_id_front": null}	{"id": 152, "phone": "01233333333", "photo": null, "gender": "male", "status": "active", "address": null, "birthdate": "2004-07-23T00:00:00.000Z", "account_id": 235, "created_at": "2026-02-24T11:21:40.059Z", "is_foreign": false, "updated_at": "2026-02-24T11:33:01.886Z", "national_id": "12324232358598", "nationality": "Egyptian", "last_name_ar": "ماجد", "last_name_en": "maged", "first_name_ar": "koko", "first_name_en": "kerolos", "health_status": null, "medical_report": null, "member_type_id": 13, "points_balance": 0, "national_id_back": null, "national_id_front": null}	2026-02-24 15:33:01.532
c7e728f1-6edd-4006-9489-4c6a4e3388c5	Admin User	Admin	Update	Members	Updated member profile: kerolos maged	نجح	::1	{"id": 152, "phone": "01233333333", "photo": null, "gender": "male", "status": "active", "address": null, "birthdate": "2004-07-23", "account_id": 235, "created_at": "2026-02-24T11:21:40.059Z", "is_foreign": false, "updated_at": "2026-02-24T11:33:01.886Z", "national_id": "12324232358598", "nationality": "Egyptian", "last_name_ar": "ماجد", "last_name_en": "maged", "first_name_ar": "koko", "first_name_en": "kerolos", "health_status": null, "medical_report": null, "member_type_id": 13, "points_balance": 0, "national_id_back": null, "national_id_front": null}	{"id": 152, "phone": "01233333333", "photo": null, "gender": "male", "status": "active", "address": null, "birthdate": "2004-07-23T00:00:00.000Z", "account_id": 235, "created_at": "2026-02-24T11:21:40.059Z", "is_foreign": false, "updated_at": "2026-02-24T11:33:22.079Z", "national_id": "12324232358598", "nationality": "Egyptian", "last_name_ar": "ماجد", "last_name_en": "maged", "first_name_ar": "كيرلس", "first_name_en": "kerolos", "health_status": null, "medical_report": null, "member_type_id": 13, "points_balance": 0, "national_id_back": null, "national_id_front": null}	2026-02-24 15:33:21.684
73d842f8-28c2-46ae-97b4-2ba8982bfbe0	Admin User	Admin	Update	Members	Updated member profile: kerolos maged	نجح	::1	{"id": 152, "phone": "01233333333", "photo": null, "gender": "male", "status": "active", "address": null, "birthdate": "2004-07-23", "account_id": 235, "created_at": "2026-02-24T11:21:40.059Z", "is_foreign": false, "updated_at": "2026-02-24T11:33:22.079Z", "national_id": "12324232358598", "nationality": "Egyptian", "last_name_ar": "ماجد", "last_name_en": "maged", "first_name_ar": "كيرلس", "first_name_en": "kerolos", "health_status": null, "medical_report": null, "member_type_id": 13, "points_balance": 0, "national_id_back": null, "national_id_front": null}	{"id": 152, "phone": "01233333333", "photo": null, "gender": "male", "status": "active", "address": null, "birthdate": "2004-07-23T00:00:00.000Z", "account_id": 235, "created_at": "2026-02-24T11:21:40.059Z", "is_foreign": false, "updated_at": "2026-02-24T11:41:59.669Z", "national_id": "12324232358598", "nationality": "Egyptian", "last_name_ar": "ماجد", "last_name_en": "maged", "first_name_ar": "kerolos", "first_name_en": "kerolos", "health_status": null, "medical_report": null, "member_type_id": 13, "points_balance": 0, "national_id_back": null, "national_id_front": null}	2026-02-24 15:41:59.246
4ba0c21b-1454-47aa-8fd3-58216e4b9035	Admin User	Admin	Update	Members	Updated member profile: kerolos maged	نجح	::1	{"id": 152, "phone": "01233333333", "photo": null, "gender": "male", "status": "active", "address": null, "birthdate": "2004-07-23", "account_id": 235, "created_at": "2026-02-24T11:21:40.059Z", "is_foreign": false, "updated_at": "2026-02-24T11:41:59.669Z", "national_id": "12324232358598", "nationality": "Egyptian", "last_name_ar": "ماجد", "last_name_en": "maged", "first_name_ar": "kerolos", "first_name_en": "kerolos", "health_status": null, "medical_report": null, "member_type_id": 13, "points_balance": 0, "national_id_back": null, "national_id_front": null}	{"id": 152, "phone": "01233333333", "photo": null, "gender": "male", "status": "active", "address": null, "birthdate": "2004-07-23T00:00:00.000Z", "account_id": 235, "created_at": "2026-02-24T11:21:40.059Z", "is_foreign": false, "updated_at": "2026-02-24T11:42:27.852Z", "national_id": "12324232358598", "nationality": "Egyptian", "last_name_ar": "maged", "last_name_en": "maged", "first_name_ar": "kerolos", "first_name_en": "kerolos", "health_status": null, "medical_report": null, "member_type_id": 13, "points_balance": 0, "national_id_back": null, "national_id_front": null}	2026-02-24 15:42:27.428
14b32fb0-f0ba-4259-9ec0-6ba756495bcf	Admin User	Admin	Update	Members	Updated member profile: kerolos maged	نجح	::1	{"id": 152, "phone": "01233333333", "photo": null, "gender": "male", "status": "active", "address": null, "birthdate": "2004-07-23", "account_id": 235, "created_at": "2026-02-24T11:21:40.059Z", "is_foreign": false, "updated_at": "2026-02-24T11:42:27.852Z", "national_id": "12324232358598", "nationality": "Egyptian", "last_name_ar": "maged", "last_name_en": "maged", "first_name_ar": "kerolos", "first_name_en": "kerolos", "health_status": null, "medical_report": null, "member_type_id": 13, "points_balance": 0, "national_id_back": null, "national_id_front": null}	{"id": 152, "phone": "01233333333", "photo": null, "gender": "male", "status": "active", "address": null, "birthdate": "2004-07-23T00:00:00.000Z", "account_id": 235, "created_at": "2026-02-24T11:21:40.059Z", "is_foreign": false, "updated_at": "2026-02-24T11:42:52.817Z", "national_id": "12324232358598", "nationality": "Egyptian", "last_name_ar": "ماجد", "last_name_en": "maged", "first_name_ar": "كيرلس", "first_name_en": "kerolos", "health_status": null, "medical_report": null, "member_type_id": 13, "points_balance": 0, "national_id_back": null, "national_id_front": null}	2026-02-24 15:42:52.471
3ec62b99-de57-4941-8a9f-0bf614d3beeb	Admin User	Admin	Approve	Members	Approved membership request for: zeyad alaa	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-24 15:47:33.626
9b698a72-391d-4062-aa41-5c3a20074d5d	zeyad alaa	Working Member	Login	Auth	User logged in: zeyad alaa	نجح	::1	\N	\N	2026-02-24 15:47:53.972
e8ae3240-b047-41d7-9c78-053105105959	kerolos kamal	Team Member	Login	Auth	User logged in: kerolos kamal	نجح	::1	\N	\N	2026-02-24 16:14:57.482
a32b1d79-55f7-46c4-a549-ed949654a1c0	Zeyad Alaa Eldin Gad	Working Member	Login	Auth	User logged in: Zeyad Alaa Eldin Gad	نجح	::1	\N	\N	2026-02-24 16:19:10.994
05f8d205-6d76-4a00-b772-4c2a8afb4e6c	Zeyad Alaa Eldin Gad	Working Member	Login	Auth	User logged in: Zeyad Alaa Eldin Gad	نجح	::1	\N	\N	2026-02-24 16:26:19.931
d85372b0-e792-4089-a35a-9e271d0c5fd8	Mohamed Salem	Founder Member	Login	Auth	User logged in: Mohamed Salem	نجح	::1	\N	\N	2026-02-24 16:30:10.115
ecaf83d9-a56a-4d41-97a1-cf7fb2b9d48a	Mohamed Salem	Founder Member	Login	Auth	User logged in: Mohamed Salem	نجح	::1	\N	\N	2026-02-24 16:31:12.661
7057a83b-6323-4929-88fa-1452181806b7	Yara Ahmed	Founder Member	Login	Auth	User logged in: Yara Ahmed	نجح	::1	\N	\N	2026-02-24 16:31:59.134
29e16ca2-253a-43b7-a5c1-d668fb526b65	Mohamed Hossam	Founder Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-24 16:34:03.306
cfaecd9d-eab7-4285-959b-26cc8f611b19	Zeyad Alaa Eldin Gad	Working Member	Login	Auth	User logged in: Zeyad Alaa Eldin Gad	نجح	::1	\N	\N	2026-02-24 16:42:52.702
7c48967b-262e-4ef0-8a6f-5a937a275de5	Mahmoud Durrah	Working Member	Login	Auth	User logged in: Mahmoud Durrah	نجح	::1	\N	\N	2026-02-24 16:47:34.526
a22689fa-2c36-4aa9-81f4-93dbadaf3a15	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-24 16:47:14.271
58f24738-c67e-4ca5-8715-49021eb2a1c0	Admin User	Admin	Approve	Members	Approved membership request for: Zeyad Alaa Eldin Gad	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-24 16:47:24.404
9f4aa279-5443-4f2f-bf4b-7ed99bf3ce50	Zeyad Alaa Eldin Gad	Student Member	Login	Auth	User logged in: Zeyad Alaa Eldin Gad	نجح	::1	\N	\N	2026-02-24 16:47:35.558
1200f811-8997-4788-973d-42af1f1a5c8f	Yara Ahmed	Founder Member	Login	Auth	User logged in: Yara Ahmed	نجح	::1	\N	\N	2026-02-24 16:59:22.606
ef76cecb-7e7a-4ccf-bb45-a3416ce72927	Mohamed Hossam	Founder Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-24 17:09:08.885
db4a8c41-3931-4855-9d81-ddffa49ad771	Mohamed Hossam	Founder Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-24 17:09:19.51
1fb2db91-0c58-491c-960a-4543c9912d23	Mahmoud Durrah	Working Member	Login	Auth	User logged in: Mahmoud Durrah	نجح	::1	\N	\N	2026-02-24 17:09:32.39
4aea4e65-074f-47ec-87be-633856f3a96a	Mahmoud Durrah	Working Member	Login	Auth	User logged in: Mahmoud Durrah	نجح	::1	\N	\N	2026-02-24 17:13:00.723
88c10739-3ea9-48ad-9019-5ca259b5a235	Yara Ahmed	Founder Member	Login	Auth	User logged in: Yara Ahmed	نجح	::1	\N	\N	2026-02-24 17:13:10.969
dc05eabb-8f0f-46c4-bce8-ba5c7fc943a4	Mohamed Hossam	Founder Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-24 17:13:19.85
83562c6e-a3a6-4185-a261-8f0a586cacdb	Mohamed Salem	Founder Member	Login	Auth	User logged in: Mohamed Salem	نجح	::1	\N	\N	2026-02-24 17:13:39.016
335b9cee-39e4-452f-868e-7b681eee9b92	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-24 17:20:28.619
48279767-8322-47d9-a021-330bab517e3f	Admin User	Admin	Status Change	Members	Changed status of member Mahmoud to active	نجح	::1	{"oldStatus": "active"}	{"newStatus": "active"}	2026-02-24 17:22:07.182
776543bd-7ac7-4b94-b392-796919d35d6b	Mohamed Salem	Founder Member	Login	Auth	User logged in: Mohamed Salem	نجح	::1	\N	\N	2026-02-24 17:23:44.441
07c1712f-f827-45b3-af9a-7ebfa4d6c440	Mahmoud Durrah	Working Member	Login	Auth	User logged in: Mahmoud Durrah	نجح	::1	\N	\N	2026-02-24 17:24:44.624
f9a1ba3e-f844-4e1a-9344-bcc98c962bad	Mahmoud Durrah	Working Member	Login	Auth	User logged in: Mahmoud Durrah	نجح	::1	\N	\N	2026-02-24 17:49:31.813
9ee2643c-cbd3-411e-9e2f-f19745514bf0	Kerolos Maged	Working Member	Login	Auth	User logged in: Kerolos Maged	نجح	::1	\N	\N	2026-02-24 17:56:02.35
5cfb8bbd-efea-47d6-bfb3-2f9f193c16ec	zeyad alaa	Team Member	Login	Auth	User logged in: zeyad alaa	نجح	::1	\N	\N	2026-02-24 18:03:19.837
0bcbf54b-58f7-4987-8de2-1086a2cc5691	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-24 18:03:57.116
2b845e76-dcfa-4d8c-995e-47e6c8374ca3	Kerolos Maged	Working Member	Login	Auth	User logged in: Kerolos Maged	نجح	::1	\N	\N	2026-02-24 19:00:51.168
ba023234-58c4-451b-be86-17e930493219	Mohamed Hossam	Founder Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-24 19:11:44.827
071b4d8d-071f-405e-aff8-04a16ed4195e	Mahmoud Durrah	Working Member	Login	Auth	User logged in: Mahmoud Durrah	نجح	::1	\N	\N	2026-02-24 19:12:17.321
b4b3c8d0-53f9-4566-8cbd-59f876c7c371	Mohamed Hossam	Founder Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-24 19:12:33.699
4930f2a8-7f98-4cb0-981b-9fc660130749	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-24 19:16:25.963
085787f5-e4a8-455e-8ef2-e89003ad0a7b	Mahmoud Durrah	Working Member	Login	Auth	User logged in: Mahmoud Durrah	نجح	::1	\N	\N	2026-02-24 19:17:22.956
58c1fef7-a9da-4e29-8013-ee56184cea76	Mohamed Salem	Founder Member	Login	Auth	User logged in: Mohamed Salem	نجح	::1	\N	\N	2026-02-24 19:18:14.16
ad26618c-edc0-4b52-9b88-8d19ec3e59a6	Admin User	Admin	Status Change	Members	Changed status of member Mahmoud to suspended	نجح	::1	{"oldStatus": "suspended"}	{"newStatus": "suspended"}	2026-02-24 19:20:14.258
5a5ab9e1-9b28-45b0-9f48-1883d27897a5	Admin User	Admin	Status Change	Members	Changed status of member Mahmoud to banned	نجح	::1	{"oldStatus": "banned"}	{"newStatus": "banned"}	2026-02-24 19:20:35.938
7555c0d1-d6da-403c-8622-6c7a1605c750	Admin User	Admin	Status Change	Members	Changed status of member Mahmoud to expired	نجح	::1	{"oldStatus": "expired"}	{"newStatus": "expired"}	2026-02-24 19:20:51.758
339b753e-1b95-4ab0-9a4d-94c089a18c41	Admin User	Admin	Status Change	Members	Changed status of member Mahmoud to cancelled	نجح	::1	{"oldStatus": "cancelled"}	{"newStatus": "cancelled"}	2026-02-24 19:21:06.417
8439f159-d6ff-4297-9c98-c8a363d18f48	Admin User	Admin	Status Change	Members	Changed status of member Mahmoud to active	نجح	::1	{"oldStatus": "active"}	{"newStatus": "active"}	2026-02-24 19:21:20.283
0fe11927-ee79-4d28-89ab-d0ae0ad262b8	Mahmoud Durrah	Working Member	Login	Auth	User logged in: Mahmoud Durrah	نجح	::1	\N	\N	2026-02-24 19:29:47.04
b2bcefe1-a8a7-42b6-9007-6ae5ce7b9879	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-24 20:34:38.567
3ad4d208-e3c5-49c3-9845-481f93af2d14	Mohamed Salem	Founder Member	Login	Auth	User logged in: Mohamed Salem	نجح	::1	\N	\N	2026-02-24 20:38:51.732
b76857da-ed67-4d5a-bd5c-7a0097777c8f	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-24 20:39:02.353
4aca4b1e-a32b-4bbe-8654-d1b9af3c8787	Mohamed Salem	Founder Member	Login	Auth	User logged in: Mohamed Salem	نجح	::1	\N	\N	2026-02-24 20:39:25.837
452bba56-969c-493b-937d-79883698011b	taleb taleb	Student Member	Login	Auth	User logged in: taleb taleb	نجح	::1	\N	\N	2026-02-24 20:44:29.994
1943e740-84c7-499f-8363-301107f9eee3	Admin User	Admin	Status Change	Members	Changed status of member taleb to active	نجح	::1	{"oldStatus": "active"}	{"newStatus": "active"}	2026-02-24 20:45:16.178
9510c0b1-4d38-461d-bd51-ba0acf8fa64d	taleb taleb	Student Member	Login	Auth	User logged in: taleb taleb	نجح	::1	\N	\N	2026-02-24 20:45:26.547
75003fbf-9335-46aa-b9e4-f4b615a2f100	Mohamed Salem	Founder Member	Login	Auth	User logged in: Mohamed Salem	نجح	::1	\N	\N	2026-02-24 21:19:44.823
cf0a298b-5bbf-4a24-a185-3eedd987c0d6	Yara Ahmed	Founder Member	Login	Auth	User logged in: Yara Ahmed	نجح	::1	\N	\N	2026-02-24 21:20:19.853
3a194631-7729-4fc1-922c-6417f6b962be	Admin User	Admin	Status Change	Members	Changed status of member Yara to suspended	نجح	::1	{"oldStatus": "suspended"}	{"newStatus": "suspended"}	2026-02-24 21:22:03.994
3ba6bc85-1515-4d08-aac0-58f4bb868245	Yara Ahmed	Founder Member	Login	Auth	User logged in: Yara Ahmed	نجح	::1	\N	\N	2026-02-24 21:22:13.392
ed3cafe2-bf95-4ceb-aac4-2cedc80d82fa	Admin User	Admin	Status Change	Members	Changed status of member Yara to active	نجح	::1	{"oldStatus": "active"}	{"newStatus": "active"}	2026-02-24 21:22:30.98
dac519ea-8ed5-490c-83ee-feb188393ed5	Yara Ahmed	Founder Member	Login	Auth	User logged in: Yara Ahmed	نجح	::1	\N	\N	2026-02-24 21:22:42.823
7a063031-6960-4c19-888a-694fb0e58131	Mohamed Hossam	Foreigner Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-24 21:26:35.275
749409ab-1ebc-4d70-b1bf-24b1684c7ee3	Admin User	Admin	Status Change	Members	Changed status of member Mohamed to active	نجح	::1	{"oldStatus": "active"}	{"newStatus": "active"}	2026-02-24 21:26:51.628
0c2f3617-b6e1-471d-b5d4-fdb676d612ca	Mohamed Hossam	Foreigner Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-24 21:26:58.145
80d977a2-ccef-430d-8c74-f0552486131e	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-24 23:13:48.987
5336c3e5-35a1-4e61-ad26-33302a051d1d	Mohamed Hossam	Foreigner Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-24 23:14:11.381
a60743a8-7b32-4028-bbcc-2cff238b8d07	Mahmoud Durrah	Working Member	Login	Auth	User logged in: Mahmoud Durrah	نجح	::1	\N	\N	2026-02-24 23:57:35.273
6829722d-b1fc-4147-a8b6-e945e24a2c46	Mohamed Hossam	Foreigner Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-25 00:03:41.824
be4518c2-d377-46e2-9d75-60b6f69d43fd	Zeyad Alaa Eldin Gad	Student Member	Login	Auth	User logged in: Zeyad Alaa Eldin Gad	نجح	::1	\N	\N	2026-02-25 00:34:17.397
a5884b9d-559d-4b46-a4db-5f4bb7de23ec	RRRRR RRRRR	Founder Member	Login	Auth	User logged in: RRRRR RRRRR	نجح	::1	\N	\N	2026-02-25 00:34:41.052
a3efac81-908f-40b8-a2dd-c163b31d2d97	Aaaa Aaaa	Team Member	Login	Auth	User logged in: Aaaa Aaaa	نجح	::1	\N	\N	2026-02-25 00:35:25.319
33e90acd-d245-4fbf-8f77-3c89a836e8db	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-25 00:36:07.294
b16964a8-ad91-4b0e-a244-453995795934	Aaaa Aaaa	Team Member	Login	Auth	User logged in: Aaaa Aaaa	نجح	::1	\N	\N	2026-02-25 00:39:28.588
8690b4cb-2e0e-4135-9c80-6e3221a9148b	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-25 00:44:38.769
1c73202d-260d-4626-8093-927befc18ac7	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-25 00:48:05.217
d5f7eb21-eb74-4c88-becc-5b30a89e897f	zz zz	Team Member	Login	Auth	User logged in: zz zz	نجح	::1	\N	\N	2026-02-25 00:48:51.476
ea44f674-b9fb-4e22-9236-29c7509d64b4	zz zz	Team Member	Login	Auth	User logged in: zz zz	نجح	::1	\N	\N	2026-02-25 01:00:27.204
63a76862-891b-462d-be13-b18968c36dcc	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-25 01:04:10.401
7d500ad3-5f6b-4002-8c4a-16debe9a79cb	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-25 01:04:52.976
309643e8-f239-4fa5-91e7-61c6b566a8ca	Mohamed Hossam	Founder Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-25 01:05:16.186
8010f767-deae-4bc2-9278-c3d649526cfb	Mohamed Hossam	Foreigner Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-25 01:06:05.809
dc9aa8e4-cf74-4fa2-9469-37aa527f0bed	Mahmoud Durrah	Working Member	Login	Auth	User logged in: Mahmoud Durrah	نجح	::1	\N	\N	2026-02-25 01:06:27.674
0024af67-ff8b-457d-9618-0ad8a75a960f	Yara Ahmed	Founder Member	Login	Auth	User logged in: Yara Ahmed	نجح	::1	\N	\N	2026-02-25 01:06:46.818
fe14d763-f607-4516-9e79-0187a2f0dfe2	Mohamed Salem	Founder Member	Login	Auth	User logged in: Mohamed Salem	نجح	::1	\N	\N	2026-02-25 01:07:20.033
c02a9c03-aee9-4ac6-b5e0-c759235c9e8e	zz zz	Team Member	Login	Auth	User logged in: zz zz	نجح	::1	\N	\N	2026-02-25 01:05:27.178
340acbd5-57e6-468a-afe1-d5c0b4fd017b	Mohamed Hossam	Foreigner Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-25 01:07:36.089
4ddff718-e3f4-4069-947a-ad6e85899fe0	zz zz	Team Member	Login	Auth	User logged in: zz zz	نجح	::1	\N	\N	2026-02-25 01:07:36.991
e73583e6-bcf9-46c0-915b-565ad996d11c	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-25 01:11:16.041
aa476ec1-8411-4b67-9306-153aeadfbaeb	Admin User	Admin	Status Change	Members	Changed status of member cc to active	نجح	::1	{"oldStatus": "active"}	{"newStatus": "active"}	2026-02-25 01:18:03.853
d6ad0fb0-b893-4d83-8d81-ce16e9231a5b	Mohamed Salem	Founder Member	Login	Auth	User logged in: Mohamed Salem	نجح	::1	\N	\N	2026-02-25 01:29:45.318
8b4ea210-3bdb-441e-8c15-8c8dcbd141d3	Mohamed Hossam	Foreigner Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-02-25 01:37:58.958
d65c138c-d2aa-4878-afac-d3bba162d89c	Mohamed Salem	Founder Member	Login	Auth	User logged in: Mohamed Salem	نجح	::1	\N	\N	2026-02-25 01:38:28.183
722e9de1-694d-4e8c-b693-193bed559cbc	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-25 04:29:30.41
4226aec1-93ce-4a46-aaeb-13d8e0d0c4de	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-25 04:42:14.293
021bbd5f-fa54-465d-89c4-bd7191ee9a2c	Admin User	admin	Create Package	Staff	Created privilege package: PKG_1771991755385	نجح	::1	\N	{"id": 10, "code": "PKG_1771991755385", "name_ar": "باقة عمو المدير", "name_en": "باقة عمو المدير", "is_active": true, "created_at": "2026-02-25T01:55:56.613Z", "updated_at": "2026-02-25T01:55:56.613Z", "description_ar": null, "description_en": null, "privileges_count": 33}	2026-02-25 05:56:01.502
314f493e-5ca7-41b2-8205-b03559d5952a	Admin User	admin	Register	Staff	Registered new staff member: Testing Date  Dateee	نجح	::1	\N	{"email": "staff.12381924812948@helwan-club.local", "message": "Staff member registered successfully", "success": true, "staff_id": 44, "account_id": 246}	2026-02-25 06:05:02.785
fc820554-153f-44b0-82de-0a30fd526f43	Admin User	admin	Assign Packages	Staff	Assigned privilege packages to staff ID: 44	نجح	::1	\N	{"package_ids": [10]}	2026-02-25 06:05:04.82
c10c5d88-5162-4016-9916-84d38cd675c6	Testing Date  Dateee	Executive Secretariat Manager	Login	Auth	User logged in: Testing Date  Dateee	نجح	::1	\N	\N	2026-02-25 06:05:15.332
e1b25400-8ae8-42e6-b76f-4ea10451bbbb	Testing Date  Dateee	Executive Secretariat Manager	Change Credentials	Auth	User changed credentials: Testing Date  Dateee	نجح	::1	\N	\N	2026-02-25 06:05:33.517
04f3b6ab-07fb-4142-8332-b475528217d7	Testing Date  Dateee	Executive Secretariat Manager	Login	Auth	User logged in: Testing Date  Dateee	نجح	::1	\N	\N	2026-02-25 06:05:39.164
ba7af31b-f0ed-46f2-85bc-4da690b0f036	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-25 06:09:58.3
8572d5cc-7158-4333-b131-801449644bfd	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-25 06:26:58.229
a070fb91-64d0-498a-8a46-e06d0082cf8d	Admin User	Admin	Status Change	Members	Changed status of member MOmom to active	نجح	::1	{"oldStatus": "active"}	{"newStatus": "active"}	2026-02-25 06:28:06.662
23ecea67-9606-49ec-99e9-97e93119e80c	Admin User	Admin	Approve	Member Sports Subscriptions	Approved sport subscription for cc cc to Basketball	نجح	::1	{"id": 25, "price": "0.00", "sport": {"id": 3, "price": "60.00", "status": "active", "name_ar": "كرة سلة", "name_en": "Basketball", "is_active": true, "created_at": "2026-02-14T21:22:13.718Z", "updated_at": "2026-02-23T02:30:26.735Z", "approved_at": "2026-02-14T23:22:13.555Z", "sport_image": null, "description_ar": null, "description_en": null, "max_participants": 0, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}, "member": {"id": 158, "phone": "01200000000", "photo": "uploads\\\\personal_photo-1771975081468-935569252.jpeg", "gender": "male", "status": "active", "address": "asdfghjkiuytre", "birthdate": "2000-02-02", "account_id": 244, "created_at": "2026-02-24T21:18:02.433Z", "is_foreign": false, "updated_at": "2026-02-24T21:18:04.037Z", "national_id": "98997896554433", "nationality": "Egyptian", "last_name_ar": "ؤؤ", "last_name_en": "cc", "first_name_ar": "ؤؤ", "first_name_en": "cc", "health_status": null, "medical_report": "uploads\\\\medical_report-1771975081473-616331086.jpeg", "member_type_id": 2, "points_balance": 0, "national_id_back": "uploads\\\\national_id_back-1771975081470-488120986.jpeg", "national_id_front": "uploads\\\\national_id_front-1771975081467-34464718.jpeg"}, "status": "pending", "team_id": 3, "end_date": null, "member_id": 158, "created_at": "2026-02-25T01:32:55.872Z", "start_date": "2026-02-25"}	{"id": 25, "price": "0.00", "sport": {"id": 3, "price": "60.00", "status": "active", "name_ar": "كرة سلة", "name_en": "Basketball", "is_active": true, "created_at": "2026-02-14T21:22:13.718Z", "updated_at": "2026-02-23T02:30:26.735Z", "approved_at": "2026-02-14T23:22:13.555Z", "sport_image": null, "description_ar": null, "description_en": null, "max_participants": 0, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}, "member": {"id": 158, "phone": "01200000000", "photo": "uploads\\\\personal_photo-1771975081468-935569252.jpeg", "gender": "male", "status": "active", "address": "asdfghjkiuytre", "birthdate": "2000-02-02", "account_id": 244, "created_at": "2026-02-24T21:18:02.433Z", "is_foreign": false, "updated_at": "2026-02-24T21:18:04.037Z", "national_id": "98997896554433", "nationality": "Egyptian", "last_name_ar": "ؤؤ", "last_name_en": "cc", "first_name_ar": "ؤؤ", "first_name_en": "cc", "health_status": null, "medical_report": "uploads\\\\medical_report-1771975081473-616331086.jpeg", "member_type_id": 2, "points_balance": 0, "national_id_back": "uploads\\\\national_id_back-1771975081470-488120986.jpeg", "national_id_front": "uploads\\\\national_id_front-1771975081467-34464718.jpeg"}, "status": "approved", "team_id": 3, "end_date": null, "member_id": 158, "created_at": "2026-02-25T01:32:55.872Z", "start_date": "2026-02-25"}	2026-02-25 06:28:37.627
42243d07-893d-4797-a6b4-ab1e032238c5	Admin User	Admin	Create	Sports	Created sport: z3ln (زعلن)	نجح	0.0.0.0	\N	{"id": 13, "price": null, "status": "active", "name_ar": "زعلن", "name_en": "z3ln", "is_active": true, "created_at": "2026-02-25T02:37:36.614Z", "updated_at": "2026-02-25T02:37:36.614Z", "approved_at": "2026-02-25T04:37:36.429Z", "sport_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAbUAAAIHCAYAAAAYQMI+AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAACUzSURBVHhe7d0tlNxG1gbghYGGhoaGhkG7hoGGgYaGhmaBgYaGgYEDDQ0NDQMDDQcu9Heu95NTc0fqltT6KZWe55w6yfGMPT3d6vt2la5K//oGAI34V/4DADgqoQZAM4QaAM0QagA0Q6gB0AyhBkAzhBoAzRBqADRDqAHQDKEGQDOEGgDNEGoANEOoAdAMoQZAM4QaAM0QagA0Q6gB0AyhBkAzhBoAzRBqADRDqAHQDKEGQDOEGgDNEGoANEOoAdAMoQZAM4QaAM0QagA0Q6gB0AyhBkAzhBoAzRBqADRDqAHQDKEGQDOEGgDNEGoANEOoAdAMoQZAM4QaAM0QagA0Q6gB0AyhBkAzhBqb+Pjx47dnz559+9e//vX9v3/88Uf+FqhSd+w6bo9BqLGJLtC68dNPP+VvgSo9ffr0wXEr2Oom1NjE77///iDUYkDtYpaWj1vBVjeVhU0JtWVF0X358qUiu5JylpaDjTqpLKymPI/WN7hdV3QV2XXkY7Ybb968yd9KJVQWVnMp0ITaMsrnM5Z4axczynxc1NyAkY9Zx279vDo8UhaeWwpO33m0bviku4zyOa19tvbbb789Og5qf+zxuPJjjUG9vDp8d39//73o5E/RNRccHs8kanRtGTpGrR9y+j6Y1fpY+Z863wWs6lKA9Q1v4nrl12rurHoNfUuNMX755Zdv//3vf/O3wyKE2kmM+bRcjl9//VXhOYD8utUyq/7w4cOjx+a4YgtCrTFTZ2HluOX8GfvIr2GMvV/D+PlPnjx59LjM+NmCUGtIfDruKyZ9Q4C1Ib+uMfacrfU1g5iZsSWh1oChcxd9w6fltuTXtxt76As0xxtb2+fo52aXzpGZhZ1Hfu33CrUcaJpB2Mv2Rz83uTYrcyL+XPLrv0eo5aYQgcaetj36meVakAmz8yqPgfJC4a12F4kVg/I8rkBjb0KtcnlZJw/nLM6tPBbevn37IOC2kDf8FWjsTahVbCjQzMrqFUtxsWv+VjOlHChbztbysqMPWNRAqFVmaKnRsk79yiK/1UypPEbClrO1cpYWH7SgBkKtIvmTr0A7lrwUt4X88+I4yX+2lvLnOD6pxbpHPaPlE+7dsNR4HPm120Lfz9tqCbLvZ8PeHI2VyJ/yBdnx1BJqWy1B9v1s2JujsRJlgXDC/Xj6lo7Xln9mZ6slyC1+BkzlaKyEAnFcQ0vHa7vUqFE+jrV2l9niZ9Ss3NUn/hsfMtjf+u88RtmyGLKsvHTcjTXPZ4XyZ+Xl6vK82lpLkFv8jJr1dSmv/ZpznQpaifKNwXF8/fr1wWtXFro1C/3Q0mMn37F5jWKbf8bSo/Y9TPt+/3jNa37MZ/D43cAuyjcGx1E2Zbx48eLR+ay1CtylpcfOFg0j5c9YY6z1uJeUL3o/wmNumQpaifJNETuJUL+YpZWv293d3fc/36LAlYU/Lz12crFdY7YWP+P169cPHs+S4yhNU3nWxn48+5XIn3ideK5fFNzu9YpZWmfNAtd3y6FL+o6rtWaPcw3tojM0A63V2NeEdXn2KxGfeGPnkPzGjsIZMwLqkvfl7GZpnfJrSwZJbkq5VvjzbC3GWrPHOfLzWP5eQzPQWpWPf6nXm+mEWkWGlnKiCK2xdMQ8uRDHh5FsjSCJQjmn8OeZY4wlg3aOodlZjKMsOWZbLDtznVCrUBSqV69ePXqzd8UolpTM3rbXt/Q3tC9nX5B0r9/UMOn7uTGmykuRtzymOS4F2dDzeCT5NWcfnvmKxZJWnKvJBSAPQbe++/v7R0t/YwpxnrGVr9m1IBkKsxhzZjNDKwHlY1rjPO6lMIsxdsZ5BOXvxT4885W7VojKEQVUuC0rwiyWG/OOIWMLcf70fusY+3MvWfoxzR1L/C61KX8/9uGZP5ixs7cY8ek4PtF/+vQp/zOMEM91DrMYfefQxrg1TObMzq659TFNHS0GWan8XdmHZ74BY4Iuls7M4q7rZmZ9y2VjlgzHmBoka4RZNmVFYM5oPcw65e/MPjzzDRkTbrFEafbWL84n9c3MYiwRZrRPqO3PM9+wL1++fJ+d9c068jjzUmXMzoY6A2NsMVOiDeVxwz488ycxZhaXR+tBN9QEstQyI+dTHkfswzN/MlNmb+WIc3ItBdzQUuOYNn0YUh5L7MMzz3dzw66VYXbGEspjin145hl0hqATZiypPLbYh2eeUVoMuLO0mbOd8vhiH555gIUItf155gEWItT255kHWIhQ259nHmAhQm1/nnmAhQi1/XnmARYi1PbnmQdYiFDbn2ceYCFCbX+eeYCFCLX9eeYBFiLU9ueZB1iIUNufZx5gAV+/fhVqFfDMAywg7jfYBVrckJd9CDWo2MePH6/eGcHtc/YXN50tX5O40zz7EGpQqQiqvrtzXxsRclFk2U7cGb57/uPu6exHqEGFfvvtt0dhNXXEclic52Fd+bVyj759CTWoTF7K6gKqz++///7oe/uG2ds6cqDFjWfZl1CDyuSlrCmf/ON7X7169SjUuvH69etvnz59yn+NGXKgTX2tWIdQg8qUhXJukYxGhejAy6HWjQjOd+/ezf73axcNNi9fvlytgSbPpgVaPYQaVKYslku4NHt7/vz5t8+fP+e/cnjdbPenn37KX5ptqBNVoNVlmXcNXPD3339//8QcS199RWGLET83znfEJ+y//vorP8SqlI97SV++fPn29u3b3tcg/rylppL8+605BFpdln3XcHrxBo9zNtHAECHSV0BrH/GY49N3nDP5888/N5/JlI9lLX2XC8SsppUlyfhd8uu6xhhq4GE/671rOIVyFhZLWflN39IoC+WaM7/yZ64pZmYR3vn3bGFJcmxX6JwhyOq27ruG5sxZSowwiOIZhWavYhlLb+/fv/9+binPUJYYcQ5nqZAr/90txMw6miry7xSvFxzNNu8aDmtOiP3888/fP81Ggd8rxG4RoRRNAbH8GEEVv0/+Ha+NW0Ku/He21LckGc8BHMm27xqqNzXEapiF7WHqzC9CLoJ+zDVi5TLn1mJJMs/aoomkhfNsnMP27xqqIsSWMSXkrgVcdz5or3M3EWD5XFsL59k4B6F2MkJsG13IxRJkuUNIHtcCbi9D17bV+FihJNRO4NL1SXkIsXWMeQ1qDLi+82zdY22l/Z+2CLVGxYwsis6lIhpDiG3vaAE31Pofw7IktRFqjYmLhYcKUAwhVpexARdLmXu79Fi1/1MLodaIaB0fOndT06d+hl0KjRg1tdf3LUvW9Pg4L6HWgHwLjG5Ek0Jcb8XxXAq4+LMaPqT0tf8LNvYm1A4uzpuVRaU7gR/n1Di+vvb6/HrvuTTZ9/gikGEvQu2gYpeKvNOFW2C0KV7TuAQjB1o59pwhxeMrZ2zx/y3t+M+xCLWD6Zal8i7kAu08hpYm9wy2eEzlY4njU/MIexBqB3B/f/+9YOUipnicW9/S357BFuf58vG55+PhnIRaxbowy11m3Yjlx6mb5dKWvmCLER+AokNxa3d3d99evHjx4LHs3dDCuQi1SvW1TMfQnk82FGwxi99DfjwRsJbG2YpQq0xfA0hXGPb45M0xDDWT7LX8F40i5XWTe23OzPkItYrEubHcACLMmCqaSMpjaK9zrrEUWT4Orf5sQahVoG92pgGEufLy317LkKHc6T/+H9Ym1HYWF87m2ZkGEG4VwVYeV3t9QMqt/s4FszahtqO8vZXZGUsqlyFrma1pGmFtQm0nOdDMzlhahEfs/xnHVzSR7CWaRspOXk0jrEmo7SAHmt1AaF00O5XHvBUJ1iLUNibQOKtyGTKG/SFZg1DbUN5RX6BxJnGsl12+cQ9AWJpQ20Bfy75A44zKZcjYzR+WJtRW1teyL9COKW642repdDfia2Yfl8V+puX7wQXZLE2orSifP9Oyf2yXAq0cXuPLXJDNmoTaSnKgadk/vgirHGBDw/Zmw/IF2WZrLEmorSCWHMs3reXGtkRY5VlbuXlvN/a84Ll2ZmusRagtLD51lucMBFpb4pxZDq9rw6ztsTxbs2TLUoTagiK8yhskxpLjkQJNI8RlQ/e460a3U0beJT+GWdtj5a1yPD8sRagtqLwOLd6kRzuHdinQynHGcMvnSGMMfWAZurcZD8Xz5PlhaY6kheSid8TllCmNEDH2ugHl1vqWHMfuX1j+HR7z/LA0R9ICcqDFebTWDM0+zhBsZRPI1HOkivZlnh+W5ki6UV+gTSl6RxO/W3kDyjMEW/m7Tn1tFe3LPD8szZF0g1YDLRoiYgujoY69vmA74nLrWLcU3lv+7hl4fliaI2mmfJ6llUArg/pSR1oOtkvfe2Sxk/wthfeWv3sGnh+W5kia6ZbzLDXqu6A4bjB5SfzO5TV5Lc7Wyvb8uFxjKkX7Ms8PS3MkzfDp06cfb8QWbk+fl1FjjA3qsui3OFsrP7zc3d3lL1+laF/m+WFpjqQZop27eyPGtWlH1hdoMUMbE2ih9WuNbvnd4mL2W/7+GXh+WJojaaK8Ddbnz5/ztxxC3+4hY2dnWcuF6ZbfLe8HyWOeH5bmSJogCn7eBuuocsGdG2ih5cJ0y+9W/t2xF2ufzS3PL/RxJE2QOwOPtg1W3+wsxpTlxj4tF6a5v1te1qWf54ilOZJGysuOR+z0y7OzGNc6HMdouTCVv9vQdXtZDrQlnuMW5YYrWEJ7VWgFLSw75kLbFdtbZmid8t9sTflBJv7/UrD1XRZxy7Ju61pquKIe7VWhFRx92TEH2tIzh5ZDLW/yHK9/3x0K8sX4MQTasLiovYWGK+rTXhVaQblsd7Rlx1xs1yi05b/fohxsY8ZSs+BW3XpROwxpswot6Mjr/tEYUt7Uco1AC2Uxb9WUYFvjOW5JnqXNuagdhrRbhRZy5HX/3BiyVrEtf0bL4vnru/1OObTuX2eWxprarkI3yp8oj7buv1WxLX8OXJLfU2ZpLE0VuuDonyi3CJvchAKXHP09Rf1UoQtu3cx2b2uHTQ60pbsqaUu+1vOI7ynqt061a8CRG0Q6a4ZaDrS1mlBoQwvXenIMy1e7Rhy5QaSzRqj1bbUl0Lgm3kPd8XLEaz05juWqXWPKpcejNYh01gi13FEp0Lgmz+qPdq0nx7JctWtIC0uPYcm9Ku/v7x+c5I/hAmOu6bv4H9Yk1Hq0sPQYlrordRSm8iLuLtDgkty+b1bPFoRajxaWHkMUkLKodCNmn5c25i3lpSPFibFy+75jhi0ItaSVpcdOXjLM4da3OW/fbvPd948NQ85N+z57EWpJK0uPnTFbO40ZZmeMpX2fPQm1pJWlxyFTNubthoYQptC+z56EWlIW85Zdm8EJMubI52Bv7bqFqdqu3DOcJdRgaTnQtO+zB5U7EWowXbnk2AWamT57ULkToQbjxfmyaAQRaNRC5U6EGozz/v37R9dBCjT2pnInQg2uy+fPItw0hVADlTsRanXru0tADBeGbycHWiw/atunFip3ItTqlu8SUI6YLQi2deVAs9xIbVTuRKjVaWiGlsctGzdzmUDjCFTuRKjVKc/QyrsE5F1SoviyLIHGUajciVCrT74nV99uJ3nj5qHNmplOoHEkKnci1OpTztKG7uMWRTaKbfn6xdCRdxuBxtGo3IlQq0uepV0qqH37WcY5NjO2eQQaR6RyJ0KtHtEcUt5xe2iWlkXhzRcFm7GNd39//2g5V6BxFCp3ItTqkZtDphTV3DyiK/K6CLOYnZUfJAQaR6NyJ0KtHuVrETdvnSrP2FygPSy2vMphJtA4IpU7EWp1iPBZ4rXIy2hmbA/F7OzVq1ePwswHAI5qfrVoVPnJ/uvXr/nLbCA3h9wSan3NI1++fMnfdkpxZ/d8Qbsw4+jmV4tGlW3huua2Fx8kcpPHnKXHLJpMun8vZiZn1p07y89zhL+lRo5OqCXlstfLly/zl1lZuVz44sWLxYpszM7KAn7GXUeGGkHsmUlLhFoSb3xLkPspOx7v7u7yl2+SlyHPFGzRDZrDLMbz58/tsE9ThFoPS5D7yBf7Lq1v15HWg63vztQxnDujVctXjgZYgtxebg4Ze6H1VGcKtpid5fNmMTMTZrRMqPWwBLm9ctlx7WujWg+2odnZu3fvVn1eoQZCbYAlyO3kWdoWhbcv2FrYSisuou6bnUX7PpyBUBtgCXIb8TzP2d9xCTnYjtwFOHQRtdkZZyPUBuQlyJaWp2qRZ2gxti7AeSutI+440ncRtdkZZyXULoiLfstC0cLy1NZip/2Y6fbNgPKGxUtcZD1HufnxXo9hDhdRw2NC7YK8PBVD08g0XXDlGVBu31eEx3MRNQwTaldEsS07yTSNTFMW3aGx5Xm0IxsKsxguoob/EWojaBqZLy+N5bF2+34LLoWZi6jhIaE2Qm4a+fTpU/4WBuSbdZYjZmgCbZgwg+mE2khlu3QUFMWYtQgzmE+ojRQNImWROVKXHMcgzOB2Qm2C8txaDDebZAnCDJYj1CYqW/zPfrNJbiPMYHlCbaJ8s0lNI0wlzGA9Qm2G8maTmkYYS5jB+oTaDNE0Um7xFMuQdhphyN9///19Y2FhBusTajP9+eefD4pTXMdmb0hKsaFwXIuXg0yYwXqE2g3yhscx7OZPhNWLFy8eHRvCDNYn1G50d3f3qIAJtvPpzpflOw90I/YPFWawPqG2gL7d/AXbOVxq/ogl6Wgqcj0jbEeoLUSwnUcEWZxTjcDqC7NYYozzq5qHYHtCbUGCrV1xW5f3798/en1zmFlihH0JtYUJtnZ0rfgRVjnAhBnUSaitoC/Y3r596yLtg4ilxfz65RE35YzX9OPHj/mvAzsSaivpC7YohHHtEvXpZmVD3Ytx7iyuOYs7n8f3AnUSaiuKYCvvw9aNKJ5mbXW4NiuLr8X3AMcg1DYQ51tyl5xZ2z5ilhWvR3QuDs3K4s/jg4cZGRyPUNtItHf3zQhiVxI7/a+nDLFrDR9mZXB8Qm1jfbO2bnbQnbOJ9nHmmRJi3fNuVgbtEGo7GJq15WIr5K6bGmKxy0c893FxtOVfaI9Q21FsnxRt4WOKcYRcFO7Ya/LM4gOBEAOGCLVKxGwsZmXRLdm3PFmOsr38DLO4LvyjuSY/F3kIMTg3oVapKOSxLdOYkDv6UmVc3hDNMhFE8XuMmYF1Q4gBJaF2EFOWKvOIvxPhGNt1RXjEhrx7id8jllDjscRjGjP7KocQAy4Ragc0ZamylnHL44yZqEsfgDGEWgOmLFXWOuImmhFcEdZmYMBcQu0EIvSiYzCWL1++fPkoULYccZfwbik0liHdQBNYklADoBlCjSrFLV1iVuk+ZcAUQo0qdZsNR7cjwFhCjSqV5+EAxlIxqJJQA+ZQMaiSUAPmUDGoklAD5lAxqJJQA+ZQMaiSUAPmUDGoklAD5lAxqJJQA+ZQMahSXHTdhVrcZgZgDKFGlWLz5S7U7CoCjCXUqFLcDdsSJDCVakG1yiVIt6gBxhBqVOvXX3/9EWpxDzaAa4Qa1YrZmSVIYAqVgqoJNWAKlYKqCbXbuNkqZ6NSUDWhNl8E2ZMnT74/dy6L4CxUCqpWdkB+/fo1f5kBHz58ePCBwIcCzsKRTtV++eWXH0U5CjXXlTO0brx58yZ/GzRJqFG1KNBdYY5zQ1zWN0OLC9nhLIQaVbu/v7eENlIsz5bLtWZonJEqQfWE2jjlfpkvXrwwQ+OUVAmqZ7uscZ4+ffrjebq7u8tfhlMQalTPdlnX5XNpcFaOfqpnu6zL8rm0+BAAZ6VCcAhCrV8sMz579uzHc+NcGmenQnAIQu2xPEOL4VwaZ6dCcAh2Fnks2vXLQIsL1eHshBqHYGeRh3777TczNOgh1DgEO4v8I3c6mqHBP4QahxA7i7he7fF5tAg0jSHwD6HGYcQ1al0xP+v1anYNgcuEGodx9uvV8izNeTR47HyVgUM7c6jlWRrw2PkqA4d21lAzS4NxzlUZOLyzXq9WXpNmlgbDhBqHcsbr1VyTBuMJNQ7lbNer5UBzTRpcJtQ4lDPdCbvvImst/HBZ21WBJp0h1HJjiECDcdqtCjTrDM0iuTFEoME4Qo3Dab1ZJC87agyB8YQah9N6s8jTp08fLDsC4wk1Dqf1ZpHyd7PsCNO0VxE4hVZDLc4Rtvq7wRa8azikVgt/bhABpmmrInAaLXZA5gutNYjAdEKNQ2qtAzIHmgYRmEeocUgtdUDmFn4XWsN8Qo1DaqkDMrfwCzSY79jVgFNrIdQ+ffr043d49uyZQIMbHbcacHotNIuU3Y7v3r3LXwYmEmoc1tGbRfKmxZ8/f87fAkwk1DisozeLvH379sfjd00aLEOocVjRLHLkJciyQcQ1abAMocahHXUJMjeIAMsQahzaUZcgX79+/eNxaxCB5Qg1Du2I16vli601iMByjlEF4IKjhVq+2BpYzjGqAFxwpGaRfC7NxdawLKHG4R2pWcS5NFiXUOPwjtIsknfidy4NlifUOLwjNIvk5hDn0mAddVYAmKj2UMvNIc6lwTrqrAAwUc2hpjkEtlNfBYAZag41O/HDduqrADBDraFmJ37YVl0VgNk+fvz4vfMvOgHPqNZQsxM/bKuuCsBsXSNCzArOqJwNffnyJX95F/E4ysdlJ35Yn1BrRK0zla38+uuvP37/V69e5S9vLppBYmbWPaaff/45fwuwgnNWwAaVoVb7rhpriFlRTcFeXmgds7W//vorfwuwgv3f/SyiXOaK8fvvv+dvaV4toZaXHc/4WsBe9n33s5gonGVRP+O5tRo2NrbsCPsSag2JgloW9lgCO5MaNja27Aj7EmqNKVvIzxZsNWxsXG6HZdkRtifUGhOztXLGcqbiuvfGxnk7LGB727/zWV0OtjOdX9vzvJp7pcH+hFqjznp+ba/zau/fv38wS7QdFuxDqDXsjOfX9jivllv43SsN9iPUGpaXIWO0fn4tzqttuQTZ18Lv1jKwH6HWuBxsZzi/tuUSpBZ+qItQO4GznV/bcglSCz/URaidRD6/1nIB3qq1Xws/1Ge9dzxVOdsy5Bah5o7WUJ/13vFUJy9DRlFeu5FiL+Xvucb91XLHoxZ+qINQO5m8DBmFucWlyDXvr9bX8QjUQaidTBTkKPJlsMVoLdjWvL+ajkeo17Lvdg7j7u7uwWyjxXNsa4Wajkeo17Lvdg4lZm1l4W/t/NoaoabjEeq23LudQyqbHVo7v7ZGs4hNi6FuQu3kcuNIjFYuzl66WaQ8lxZDxyPUR6jx6PzakjObPeVmkVt+pxxoNi2GOgk1vovza7Gl1JIzmxqUnZ5zf6e+QLNpMdRJqPFDntm0sAyZf6epYkNkgQbHMf1dTtPKRohWgu2WUCvb9wUa1G/6u5ym5T0iWwi2W7ogy+dBoEH9hBqPtBZsc7sg47q98jkA6uedSq+Wgm3uebXycofoDgXqN/4dzun0BdvU5btaTA21mKWVy5Zx2QNQv3HvcE6rlVb/qaFmlgbHNO4dzqnl5bsjztamhJpZGhzX9Xc4LHQR856mhJpZGhzX9Xc49MzWjtY0Us68Lm3abJYGxybUGO3IF2aXs69L944zS4NjE2qM1tcNeZRgy/eO62OWBsfX/+6GAX3BdpTGkWs7i5ilwfEJNSY7apv/pZ1FzNKgDUKNWXLjyJs3b74HQ83yY+58/Pjx27Nnz8zSoAFCjdly40jMdP7444/8bVXpC7VyJ/4YZmlwXEKN2WIZsrx+rRt956tqkVv7++6XBhyXUONmMbN5/vz5j2DI56tqklv7y1lanHMDjk2osYih81W1ya395XC/NDi+eqsPh1MGxKVdO/ZWLkGapUFbhBqLyWFR67m1CNwcaGZp0AahxmJyWOx1bi1a9OM6uto7MYHlCTUWlc+tbT1biyB78uTJ9599aY9HoE1CjcWVbf5xUfMWM6Z8AXU3gHPxrmdxeba25oxpKMxixC4nwLkINVYRgVIGzBq7+ZdLjeX4z3/+8+3f//73JjNEoC5CjdWUFzrHWGop8trsrLuges0ZIlAnocZq+m5Tc2vQDM3OyqXG8s+Bc/GuZ1URbHnj4ylLkZdmZTH6rjErr5eb8rOA4xNqbKJvKTI2Ex5yLcxiDDWC5J9V8+4mwLKEGpvoW4qcO/pmZ6X8s25d8gSOQ6ixmb6lyLFjaFY2JG9cDJyDdzubmxJuU8Os5NwanI9Qo1nOrcH5CDWa5dwanI9Qo2kRbOUy5NYbLAPbEmo0L7olu1Db63Y4wDaEGs3LGywD7fIO5xSEGpyDdzinoL0fzkGocQq5vV/DCLRJqHEK0QX58uVLDSPQOKHGaWgYgfZ5Z3MqrlmDtgk1TsU1a9A2ocapWIKEtnlXczrlEqRNjqEtQo3TKdv7bXIMbRFqnI4biEK7vKM5JaEGbfKO5pTKUPvjjz/yl4GDEmqcUtks4rwatEOocUrR9bj0EuT9/f33zZKfPXv24N8eM+LvvHnz5tunT5/yPwtMsMy7GQ5oqdb+WL6cE2RD4+nTp987NL9+/Zp/FHCFUOO0bmnt//jx46JB1jfiMd0StnBGQo3Titb+qbO1a7Oy+NqcxpPY6SRCtu/fjmVJszYYR6hxalNmax8+fHgUON2IPSUjJJdwd3f37cWLFw/+/XhsliThOqHGqU25EDvOdeUwi1nUGuJxxYbL+ed1I2Z0Y2aWcDaX38VwAtdCre/82VKzsmv6Zm3lcPsceKj/XQwnci3U8gwtlhq3NhRucTdvS5Lwj/53MZzIpWaRaPrIgbbVLG1Ivn2OLkn4h1Dj9IaaReJC6jwzqkWcy8uPLR4vnF0971LYSV9rf1+n41pNIXP1LUkKNs5OqEHPbK08j/bLL7/svuQ4JB5XPD7BBv8j1KCntb8ctQZaR7DBP4Qa/L8cZjH26HScQ7DB/wg1+H/lebWjzNJKgg2EGvxQnleLUVtjyBiCjbMTapzStY2JY8zdnHhvgo0zE2qcTl+7/qVxxHATbJyVUONUYh/HJ0+ePAqua+PaDv41EmyckVDjJkPLePFnMSOqSV+gDTWCxAXY5fcd8fxa6As292ejZUKN2cYs49U0M8gbEx81qKbqC7aYeR5tSRXGEGrMlkNiaNRwTipvTHyWQOtEsPXdn82ta2iNUGO2sjiWy3hDM4O99M0ozyr2i3z+/PmP5yGCDlpy3nc3N7sUEhFsr1+/fhQmW8/a+s6jnW2WluVb13z69Cl/CxzW42oEI10KtU6+oDlGzNq2alTIS6RDjSFnU37giA8anhdaMVyN4IoxoTY0Y9vixpYxSyt/5tlnaKX4UFEGvueGVgxXI7hiTKiV+mZta7X+9y078tCff/754PmpqVMV5vJOZ7Y5gdF3Y8s1CmpedjQT6Rd3IVjzdYCtja9GkMwJtTC0JLlUQY1/R6CN09epqnGEI5tWjaAwN9Q6fQX11uXIHGhHuR/anuJ1ePny5YPXQOMIRzWvGsECoRb6gi3GnFlbvh4t/l3FeZxoHCnPQZrdclTzqxGnt0SohVuXI6MpJO8/KdCmy7uurN2dCmu4rRpxakuFWqdv1nZpOXJoM+UYAm2evJXWVtcTwlKWqUacTjQTlMGzlL5gmzosnc0Xz//PP//847kc+kABtRJqzBLB0RW+d+/e5S/fZGg58toQZssolyGjgQSORKgxS3kd2OfPn/OXFzEm3KK70VLjsu7v77/v+NI9x3by50iEGrOUwUJ7ynNrdvLnSFQkZhFqbcs7+ZutcRQqErMItfaZrXFEKhKzCLX2ma1xRCoSswi1czBb42hUJGYRaueQZ2tjd3mBvahIzCLUziNfViHYqJmKxCxC7Tz6dnlxfo1aqUjMItTOJd+exvk1aqUiMYtQO598fs1mx9RIRWIWoXZO5TKkzY6pkYrELELtnGx2TO1UJGYRaueUNzt2I1FqoyIxi1A7r/K2QxFwUBMViVmE2nlFJ6TXn1o5Iplsrbtecxzut0athBqTrXnXa44hbs7aHQOuWaMmQo3JtrjrNXXL16zZOotaCDUmcz6FkPeEtAxJDVQlJhNqBFtnUSNVicmEGp28DGm2xt5UJSYTapTcSJSaqEpMJtQoma1RE1WJyYQamdkatVCVmEyokeXZmj0h2YuqxGRCjT5li789IdmLqsRkQo0+9oSkBo48JlO4GOLYYG+OPCZTuBhSHhtxQ1HYmqrEZEKNIeXu/c6rsQdViUk+fPgg1BgUXY9ma+xJVWKScof+uP0IZGZr7EmoMUn5KTy63SDLszXYkiOOSRQrxnCcsBdHHJMoVozhOGEvjjgmUawYw3HCXhxxTKJYMYbjhL044phEsWIMxwl7ccQxiWLFGI4T9uKIYxLFijHKa9VgS444JhFqjNFdq/bmzZv8JViVysQkQg2omcrEJEINqJnKxCRCDaiZysQkQg2omcrEJEINqJnKxCRCDaiZysQkQg2omcrEJEINqJnKxCRCDaiZysQkQg2omcrEJEINqJnKxCQ2qgVqpjIxiY1qgZoJNQCaIdQAaIZQA6AZQg2AZgg1AJoh1ABohlADoBlCDYBmCDUAmiHUAGiGUAOgGUINgGYINQCaIdQAaIZQA6AZQg2AZgg1AJoh1ABohlADoBlCDYBmCDUAmiHUAGiGUAOgGUINgGYINQCaIdQAaIZQA6AZQg2AZgg1AJoh1ABohlADoBlCDYBmCDUAmiHUAGiGUAOgGUINgGYINQCaIdQAaIZQA6AZQg2AZgg1AJoh1ABohlADoBlCDYBmCDUAmiHUAGiGUAOgGUINgGYINQCaIdQAaMb/Ade86GHmg7aKAAAAAElFTkSuQmCC", "description_ar": null, "description_en": null, "max_participants": 0, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	2026-02-25 06:37:37.009
18ae91c7-253c-4ced-99f3-e7514cbbebbf	Admin User	Admin	Delete	MediaGallery	Deleted media post: الحياه حلوه	نجح	::1	{"date": "2026-02-22T04:36:14.608Z", "title": "الحياه حلوه", "images": ["/uploads/images-1771734974605-752171960.png"], "category": "صور", "videoUrl": "", "created_at": "2026-02-22T02:36:16.252Z", "updated_at": "2026-02-22T02:36:16.252Z", "description": "حبوا بعض", "videoDuration": null}	\N	2026-02-25 06:39:48.465
091511a9-7e52-4d56-9322-8232eab65db4	Admin User	Admin	Approve	Members	Approved membership request for: Testingggg photosss	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-02-25 06:45:14.77
032c5420-f239-4afd-9e2e-ac31fb4bb309	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-28 01:33:43.296
4aa45ffa-397f-4ea0-a348-530164e1f07c	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-28 02:09:07.246
d296038d-4a48-43df-b27a-bf7fe2e97afb	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-28 03:29:35.29
7aef7387-fa7b-4cf7-8bad-8a8bce17da68	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-02-28 20:19:57.04
337d36f6-d681-49f3-8151-9dd8b67e2cff	Admin User	Admin	Create	Sports	Created sport: Football2 (2كرة القدم)	نجح	0.0.0.0	\N	{"id": 14, "price": 150, "status": "active", "name_ar": "2كرة القدم", "name_en": "Football2", "is_active": true, "created_at": "2026-02-28T16:21:08.601Z", "updated_at": "2026-02-28T16:21:08.601Z", "approved_at": "2026-02-28T18:21:09.020Z", "sport_image": "base64_encoded_image_or_url", "description_ar": "رياضة جماعية مع كرة بين فريقين", "description_en": "Team sport with ball between two teams", "max_participants": 22, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	2026-02-28 20:21:09.376
5f749ce8-00bb-4f4b-9947-9a615b206a1c	Admin User	Admin	Update	Sports	Updated sport: Football Updated	نجح	0.0.0.0	{"id": 14, "price": "150.00", "status": "active", "name_ar": "2كرة القدم", "name_en": "Football2", "is_active": true, "created_at": "2026-02-28T16:21:08.601Z", "updated_at": "2026-02-28T16:21:08.601Z", "approved_at": "2026-02-28T18:21:09.020Z", "sport_image": "base64_encoded_image_or_url", "description_ar": "رياضة جماعية مع كرة بين فريقين", "description_en": "Team sport with ball between two teams", "max_participants": 22, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	{"id": 14, "price": 175, "status": "active", "name_ar": "2كرة القدم", "name_en": "Football Updated", "is_active": true, "created_at": "2026-02-28T16:21:08.601Z", "updated_at": "2026-02-28T16:23:35.233Z", "approved_at": "2026-02-28T18:21:09.020Z", "sport_image": "base64_encoded_image_or_url", "description_ar": "رياضة جماعية مع كرة بين فريقين", "description_en": "Updated description", "max_participants": 22, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	2026-02-28 20:23:36.458
f72b46d7-2386-437b-bf2d-c275a5d62ed3	Admin User	Admin	Toggle Status	Sports	Toggled sport status: Football Updated to Active	نجح	0.0.0.0	\N	{"id": 14, "price": "175.00", "status": "pending", "name_ar": "2كرة القدم", "name_en": "Football Updated", "is_active": true, "created_at": "2026-02-28T16:21:08.601Z", "updated_at": "2026-02-28T16:26:37.214Z", "approved_at": "2026-02-28T18:21:09.020Z", "sport_image": "base64_encoded_image_or_url", "description_ar": "رياضة جماعية مع كرة بين فريقين", "description_en": "Updated description", "max_participants": 22, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	2026-02-28 20:26:39.296
fbc91cd5-3d27-48ae-87be-644c466af9d7	Admin User	Admin	Delete	Sports	Deleted sport: Football Updated (2كرة القدم)	نجح	0.0.0.0	{"price": "175.00", "status": "pending", "name_ar": "2كرة القدم", "name_en": "Football Updated", "is_active": true, "created_at": "2026-02-28T16:21:08.601Z", "updated_at": "2026-02-28T16:26:37.214Z", "approved_at": "2026-02-28T18:21:09.020Z", "sport_image": "base64_encoded_image_or_url", "description_ar": "رياضة جماعية مع كرة بين فريقين", "description_en": "Updated description", "max_participants": 22, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	\N	2026-02-28 20:28:23.284
810e3b83-922f-4ee8-80f3-9dc47d2715aa	Admin User	Admin	Create	Sports	Created sport: Karate (كارتيه)	نجح	0.0.0.0	\N	{"id": 15, "price": 150, "status": "active", "name_ar": "كارتيه", "name_en": "Karate", "is_active": true, "created_at": "2026-02-28T16:29:55.329Z", "updated_at": "2026-02-28T16:29:55.329Z", "approved_at": "2026-02-28T18:29:55.591Z", "sport_image": "base64_encoded_image_or_url", "description_ar": null, "description_en": null, "max_participants": 22, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	2026-02-28 20:29:56.313
79f3dd53-119a-4196-85d7-8c9d16ea1c1c	Mohamed Hossam	Founder Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-03-01 00:01:19.935
ec419eb4-f5fd-4591-a5a0-7ddf7b1ec8ab	Yara Ahmed	Founder Member	Login	Auth	User logged in: Yara Ahmed	نجح	::1	\N	\N	2026-03-01 00:06:57.938
36592845-aa32-4d08-b114-2a8b12a0d28a	Mohamed Salem	Founder Member	Login	Auth	User logged in: Mohamed Salem	نجح	::1	\N	\N	2026-03-01 00:07:09.149
d9ffe4b1-ad7d-4a25-bd37-d97df2721adf	Mohamed Hossam	Foreigner Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-03-01 00:07:28.887
0f292400-c571-4f39-9fb9-be87e95c55bf	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-03-01 01:53:04.147
6e0bcae1-e540-429f-9b1d-ef469ac3268e	Mohamed Hossam	Foreigner Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-03-01 01:53:21.555
7f94c0c3-8890-4d99-905c-603675f727e9	Mohamed Hossam	Foreigner Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-03-01 03:47:15.009
f5ec6ecc-baa9-4085-ad5b-66ece9c9f057	Mohamed Hossam	Foreigner Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-03-01 03:59:00.533
501dc54e-b60e-4701-880c-96c8bee6953d	Mohamed Hossam	Foreigner Member	Login	Auth	User logged in: Mohamed Hossam	نجح	::1	\N	\N	2026-03-01 04:38:39.288
a4baddb4-f9c2-492d-85ad-b9506e994fe4	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-03-01 05:03:29.124
3505c285-e33f-4bbb-92f2-67d8c8a9222e	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-03-01 05:09:41.247
f727caf5-a268-43b5-954c-7a809a9baf6d	Admin User	Admin	Approve	Members	Approved membership request for: Ford Raptor	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-03-01 05:09:52.251
71d4040f-346f-426e-ac6f-7af6198a5abd	Admin User	Admin	Approve	Members	Approved membership request for: Omar Marmosh	نجح	::1	{"status": "pending"}	{"status": "active"}	2026-03-01 05:10:05.479
1d1076cf-1fa8-43c5-a1fd-d582084c707f	Omar Marmosh	Student Member	Login	Auth	User logged in: Omar Marmosh	نجح	::1	\N	\N	2026-03-01 05:11:09.466
6a85fd1a-249c-4c21-b613-b4bac042d2e7	Ford Raptor	Student Member	Login	Auth	User logged in: Ford Raptor	نجح	::1	\N	\N	2026-03-01 05:12:04.07
b9591cc0-c85e-4d30-ad4b-e8b7308fd843	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-03-01 05:34:02.811
e0601a6c-2fa3-43f5-9048-40d700f46f6b	Admin User	Admin	Update	Sports	Updated sport: Karate	نجح	0.0.0.0	{"id": 15, "price": "150.00", "status": "active", "name_ar": "كارتيه", "name_en": "Karate", "is_active": true, "created_at": "2026-02-28T16:29:55.329Z", "updated_at": "2026-02-28T16:29:55.329Z", "approved_at": "2026-02-28T18:29:55.591Z", "sport_image": null, "description_ar": null, "description_en": null, "max_participants": 22, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	{"id": 15, "price": 150, "status": "active", "name_ar": "كارتيه", "name_en": "Karate", "is_active": true, "created_at": "2026-02-28T16:29:55.329Z", "updated_at": "2026-03-01T01:38:29.669Z", "approved_at": "2026-02-28T18:29:55.591Z", "sport_image": null, "description_ar": null, "description_en": null, "max_participants": 22, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	2026-03-01 05:38:30.926
22b332b3-1509-439f-9024-509dc789e917	Ford Raptor	Student Member	Login	Auth	User logged in: Ford Raptor	نجح	::1	\N	\N	2026-03-01 05:47:31.775
c736ba5c-247c-4691-9a57-62a6ccf5fb26	Admin User	Admin	Update	Sports	Updated sport: Karate	نجح	0.0.0.0	{"id": 15, "price": "150.00", "status": "active", "name_ar": "كارتيه", "name_en": "Karate", "is_active": true, "created_at": "2026-02-28T16:29:55.329Z", "updated_at": "2026-03-01T01:38:29.669Z", "approved_at": "2026-02-28T18:29:55.591Z", "sport_image": null, "description_ar": null, "description_en": null, "max_participants": 22, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	{"id": 15, "price": 150, "status": "active", "name_ar": "كارتيه", "name_en": "Karate", "is_active": true, "created_at": "2026-02-28T16:29:55.329Z", "updated_at": "2026-03-01T01:50:05.565Z", "approved_at": "2026-02-28T18:29:55.591Z", "sport_image": null, "description_ar": null, "description_en": null, "max_participants": 22, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	2026-03-01 05:50:07.338
52d4506e-967a-4f15-887e-ff8f570c9033	Admin User	Admin	Delete	Sports	Deleted sport: Karate (كارتيه)	نجح	0.0.0.0	{"price": "150.00", "status": "active", "name_ar": "كارتيه", "name_en": "Karate", "is_active": true, "created_at": "2026-02-28T16:29:55.329Z", "updated_at": "2026-03-01T01:50:05.565Z", "approved_at": "2026-02-28T18:29:55.591Z", "sport_image": null, "description_ar": null, "description_en": null, "max_participants": 22, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	\N	2026-03-01 05:50:23.044
5e81652d-2031-4631-9ef1-74e98332af3a	Admin User	Admin	Update	Sports	Updated sport: z3ln	نجح	0.0.0.0	{"id": 13, "price": null, "status": "active", "name_ar": "زعلن", "name_en": "z3ln", "is_active": true, "created_at": "2026-02-25T02:37:36.614Z", "updated_at": "2026-02-25T02:37:36.614Z", "approved_at": "2026-02-25T04:37:36.429Z", "sport_image": null, "description_ar": null, "description_en": null, "max_participants": 0, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	{"id": 13, "price": 0, "status": "active", "name_ar": "زعلن", "name_en": "z3ln", "is_active": true, "created_at": "2026-02-25T02:37:36.614Z", "updated_at": "2026-03-01T01:53:47.081Z", "approved_at": "2026-02-25T04:37:36.429Z", "sport_image": null, "description_ar": null, "description_en": null, "max_participants": 0, "approval_comments": null, "created_by_staff_id": 1, "approved_by_staff_id": 1}	2026-03-01 05:53:48.48
b1c8c4d6-6d60-4fa1-be6b-74a56c8e9d89	Ford Raptor	Student Member	Login	Auth	User logged in: Ford Raptor	نجح	::1	\N	\N	2026-03-01 13:53:32.633
e5beb8f2-ac1f-4361-b447-794d753a60be	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-03-01 13:54:27.398
5de17133-23af-4926-b943-939468404741	Omar Ehab	Student Member	Login	Auth	User logged in: Omar Ehab	نجح	::1	\N	\N	2026-03-01 14:03:19.142
dac796b0-56e7-45b4-91ed-e9579641e2b4	Omar Ehab	Student Member	Login	Auth	User logged in: Omar Ehab	نجح	::1	\N	\N	2026-03-01 14:10:38.192
80250f29-9ad9-4e0b-b836-f0ca9d471a4a	Omar Ehab	Student Member	Login	Auth	User logged in: Omar Ehab	نجح	::1	\N	\N	2026-03-01 14:10:46.717
8c4da38d-04da-4d1d-b61e-d92b6bb57226	Admin User	Admin	Status Change	Members	Changed status of member Omar to active	نجح	::1	{"oldStatus": "active"}	{"newStatus": "active"}	2026-03-01 14:11:35.297
c5db2988-6e44-4908-879a-ed5fb2bcd3f7	Omar Ehab	Student Member	Login	Auth	User logged in: Omar Ehab	نجح	::1	\N	\N	2026-03-01 14:11:53.552
32cce372-24dc-42d4-af71-44039e2e286c	Omar Ehab	Student Member	Login	Auth	User logged in: Omar Ehab	نجح	::1	\N	\N	2026-03-01 14:12:13.695
cddc6051-7839-470a-8a33-4d6aefdec09a	Omar Ehab	Student Member	Login	Auth	User logged in: Omar Ehab	نجح	::1	\N	\N	2026-03-01 14:17:15.455
ef30d062-9923-4414-935c-0e3d06c65522	Mohamed Salem	Founder Member	Login	Auth	User logged in: Mohamed Salem	نجح	::1	\N	\N	2026-03-01 14:23:18.139
0795d25f-7e02-45f9-8204-9923d9cbf5e9	Mohamed Salem	Founder Member	Login	Auth	User logged in: Mohamed Salem	نجح	::1	\N	\N	2026-03-01 14:23:26.453
10e7e02a-2082-4b62-8190-eb826f71ab64	Mohamed Salem	Founder Member	Login	Auth	User logged in: Mohamed Salem	نجح	::1	\N	\N	2026-03-01 14:26:24.936
d0f59a9b-6fae-4631-9de7-7bc356d9b97b	Omar Ehab	Student Member	Login	Auth	User logged in: Omar Ehab	نجح	::1	\N	\N	2026-03-01 14:26:41.22
c78b2350-0dbe-4a54-9cd6-82d0f2ef5a59	Omar Ehab	Student Member	Login	Auth	User logged in: Omar Ehab	نجح	::1	\N	\N	2026-03-01 14:26:47.98
e7836480-d590-4b56-bcc0-78b2ac0e33c2	Omar Ehab	Student Member	Login	Auth	User logged in: Omar Ehab	نجح	::1	\N	\N	2026-03-01 14:27:07.438
17fe8b04-be2b-4160-b278-6cb31f87d870	Omar Ehab	Student Member	Login	Auth	User logged in: Omar Ehab	نجح	::1	\N	\N	2026-03-01 14:29:22.279
4a61974e-b57b-408c-8e3b-28ac8532a7a7	Ford Raptor	Student Member	Login	Auth	User logged in: Ford Raptor	نجح	::1	\N	\N	2026-03-01 14:46:53.66
683ce54e-76f2-4a60-b7ac-dc639917fa12	Omar Ehab	Student Member	Login	Auth	User logged in: Omar Ehab	نجح	::1	\N	\N	2026-03-01 14:48:17.851
f78ff297-4dab-4b86-ab69-e0fc1a6322ea	Omar Ehab	Student Member	Login	Auth	User logged in: Omar Ehab	نجح	::1	\N	\N	2026-03-01 16:09:03.156
f82db1bc-c94e-4c7b-9e83-58bdc39b5c75	Omar Ehab	Student Member	Login	Auth	User logged in: Omar Ehab	نجح	::1	\N	\N	2026-03-01 16:27:09.426
b72f517f-ea86-4eb4-b4ed-a960841b7a0c	Omar Ehab	Student Member	Login	Auth	User logged in: Omar Ehab	نجح	::1	\N	\N	2026-03-01 19:22:38.536
75a29f16-d565-4bad-84cf-374daee6a39f	Omar Ehab	Student Member	Login	Auth	User logged in: Omar Ehab	نجح	::1	\N	\N	2026-03-01 19:40:15.997
604eefb5-daf9-4bc7-8492-881757168569	Omar Ehab	Student Member	Login	Auth	User logged in: Omar Ehab	نجح	::1	\N	\N	2026-03-01 19:40:33.08
f30fd25f-f093-40e8-8c7f-17c2a2f1e058	Omar Ehab	Student Member	Login	Auth	User logged in: Omar Ehab	نجح	::1	\N	\N	2026-03-01 20:01:21.232
06d021f0-79f8-4361-b758-663d875044ea	Mahmoud Khaled	Student Member	Login	Auth	User logged in: Mahmoud Khaled	نجح	::1	\N	\N	2026-03-01 20:06:56.598
c1a2f816-a25d-48cc-b3d0-39785eba22f9	Admin User	Admin	Status Change	Members	Changed status of member Mahmoud to active	نجح	::1	{"oldStatus": "active"}	{"newStatus": "active"}	2026-03-01 20:08:10.905
4d4b2f98-81d1-4725-b2ac-f14c966ae555	Mahmoud Khaled	Student Member	Login	Auth	User logged in: Mahmoud Khaled	نجح	::1	\N	\N	2026-03-01 20:37:42.923
8f013f57-399f-466a-b619-6ecf5fb20271	Abdo Just	Student Member	Login	Auth	User logged in: Abdo Just	نجح	::1	\N	\N	2026-03-01 21:07:31.525
b9126a89-2645-40fb-96ec-007747958e65	Mahmoud Khaled	Student Member	Login	Auth	User logged in: Mahmoud Khaled	نجح	::1	\N	\N	2026-03-01 21:07:51.566
cc0caef0-acd8-448e-980f-dbc8a9671b78	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-03-01 23:12:48.93
55066dc4-e0c6-48f1-aac0-92866b8c6d0f	kk kk	Team Member	Login	Auth	User logged in: kk kk	نجح	::1	\N	\N	2026-03-01 23:14:26.606
d06119c3-71c4-437a-9d63-6b92b6037afa	Admin User	Admin	Login	Auth	User logged in: Admin User	نجح	::1	\N	\N	2026-03-02 00:43:57.983
\.


--
-- Data for Name: booking_participants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.booking_participants (id, booking_id, full_name, phone_number, national_id, email, is_creator, created_at) FROM stdin;
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bookings (id, member_id, team_member_id, field_id, sport_id, start_time, end_time, price, status, payment_reference, payment_completed_at, share_token, expected_participants, notes, language, created_at, updated_at, completed_at, cancelled_at) FROM stdin;
\.


--
-- Data for Name: branch_sport_teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branch_sport_teams (id, branch_id, sport_id, created_by_staff_id, name_en, name_ar, description_en, description_ar, training_days, start_time, end_time, monthly_fee, registration_fee, max_participants, current_participants, status, status_reason, approved_by_staff_id, approved_at, approval_comments, team_image, min_age, max_age, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branches (id, code, name_en, name_ar, location_en, location_ar, phone, created_at, updated_at) FROM stdin;
1	HELWAN_UNI	Helwan University Branch	فرع جامعة حلوان	Helwan University	جامعة  حلوان	\N	2026-02-28 18:34:08.343723	2026-02-28 18:34:08.343723
\.


--
-- Data for Name: employee_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_details (id, member_id, profession_id, department_en, department_ar, salary, salary_slip, employment_start_date, created_at, updated_at) FROM stdin;
6	6	2	IT Department	قسم تكنولوجيا المعلومات	8500.00	path/to/salary_slip.pdf	2022-01-01	2026-01-25 23:49:21.090516	2026-01-25 23:49:21.090516
7	26	1	adad	adad	413142.00	\N	2026-02-01	2026-02-01 02:13:55.682314	2026-02-01 02:13:55.682314
8	27	2	dada	dada	1412.00	\N	2026-02-01	2026-02-01 02:27:16.856146	2026-02-01 02:27:16.856146
9	46	1	4124	4124	2000.00	\N	2026-02-15	2026-02-14 23:33:07.792608	2026-02-14 23:33:07.792608
10	48	1	dadda	dadda	5000.00	\N	2026-02-15	2026-02-15 00:20:08.124704	2026-02-15 00:20:08.124704
11	50	1	العالمي	العالمي	3000.00	\N	2026-02-15	2026-02-15 00:25:16.548471	2026-02-15 00:25:16.548471
12	53	2	Momo	Momo	3000.00	\N	2026-02-17	2026-02-17 01:05:05.424117	2026-02-17 01:05:05.424117
13	57	1	cs	cs	20000.00	\N	2026-02-17	2026-02-17 16:24:57.28272	2026-02-17 16:24:57.28272
14	81	1	hhh	hhh	200000.00	\N	2026-02-18	2026-02-18 11:09:05.224419	2026-02-18 11:09:05.224419
15	90	1	adawdawd	adawdawd	2998.00	\N	2026-02-20	2026-02-20 15:00:21.555697	2026-02-20 15:00:21.555697
16	91	2	11111111111	11111111111	1111.00	\N	2026-02-20	2026-02-20 15:02:19.389789	2026-02-20 15:02:19.389789
17	94	2	cs	cs	2000000.00	\N	2026-02-20	2026-02-20 18:30:35.63079	2026-02-20 18:30:35.63079
18	104	1	cs	cs	20000.00	\N	2026-02-21	2026-02-21 18:12:59.109226	2026-02-21 18:12:59.109226
19	107	2	cs	cs	200000.00	\N	2026-02-21	2026-02-21 18:30:02.850256	2026-02-21 18:30:02.850256
20	108	1	IT	IT	10000.00	\N	2026-02-21	2026-02-21 18:36:16.263154	2026-02-21 18:36:16.263154
21	109	3	cs	cs	256300.00	\N	2026-02-21	2026-02-21 18:45:09.342035	2026-02-21 18:45:09.342035
22	110	1	cs	cs	12500.00	\N	2026-02-21	2026-02-21 18:54:29.39971	2026-02-21 18:54:29.39971
23	111	2	cs	cs	12344.00	\N	2026-02-21	2026-02-21 19:25:42.052808	2026-02-21 19:25:42.052808
24	132	1	hjhghgh	hjhghgh	12000.00	\N	2026-02-21	2026-02-21 21:33:06.383064	2026-02-21 21:33:06.383064
25	134	1	hjhghgh	hjhghgh	10000.00	\N	2026-02-21	2026-02-21 21:42:11.026549	2026-02-21 21:42:11.026549
26	146	1	dad	dad	124124.00	\N	2026-02-22	2026-02-22 04:06:59.038239	2026-02-22 04:06:59.038239
27	147	1	awd	awd	41241.00	\N	2026-02-22	2026-02-22 20:10:53.948343	2026-02-22 20:10:53.948343
28	148	1	dad	dad	14124.00	\N	2026-02-24	2026-02-24 00:50:19.503958	2026-02-24 00:50:19.503958
29	151	1	hhh	hhh	200000.00	\N	2026-02-24	2026-02-24 12:33:55.207454	2026-02-24 12:33:55.207454
30	153	1	hjfff	hjfff	1999.00	\N	2026-02-24	2026-02-24 13:47:04.855659	2026-02-24 13:47:04.855659
31	154	2	SWE	SWE	10000.00	\N	2026-02-24	2026-02-24 14:45:12.977254	2026-02-24 14:45:12.977254
32	158	1	ascas	ascas	90000.00	\N	2026-02-25	2026-02-24 23:18:03.089407	2026-02-24 23:18:03.089407
33	159	1	4cas	4cas	1250.00	https://res.cloudinary.com/dkjnugbsd/image/upload/v1771986542/helwan-club/members/salary-slips/helwan-club/members/salary-slips/222-1771986542277.png	2026-02-25	2026-02-25 02:29:03.613117	2026-02-25 02:29:03.613117
34	160	1	cawae	cawae	1174.00	https://res.cloudinary.com/dkjnugbsd/image/upload/v1771993682/helwan-club/members/salary-slips/helwan-club/members/salary-slips/222-1771993681888.png	2026-02-25	2026-02-25 04:28:03.071383	2026-02-25 04:28:03.071383
\.


--
-- Data for Name: faculties; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.faculties (id, code, name_en, name_ar, created_at, updated_at) FROM stdin;
1	ARTS	Faculty of Arts	كلية الآداب	2026-01-24 15:58:22.359101	2026-01-24 15:58:22.359101
2	LAW	Faculty of Law	كلية الحقوق	2026-01-24 15:58:22.359101	2026-01-24 15:58:22.359101
3	COM	Faculty of Commerce and Business Administration	كلية التجارة وإدارة الأعمال	2026-01-24 15:58:22.359101	2026-01-24 15:58:22.359101
4	EDU	Faculty of Education	كلية التربية	2026-01-24 15:58:22.359101	2026-01-24 15:58:22.359101
5	SCI	Faculty of Science	كلية العلوم	2026-01-24 15:58:22.359101	2026-01-24 15:58:22.359101
6	PHARM	Faculty of Pharmacy	كلية الصيدلة	2026-01-24 15:58:22.359101	2026-01-24 15:58:22.359101
7	MED	Faculty of Medicine	كلية الطب	2026-01-24 15:58:22.359101	2026-01-24 15:58:22.359101
8	NURS	Faculty of Nursing	كلية التمريض	2026-01-24 15:58:22.359101	2026-01-24 15:58:22.359101
9	ENG_HEL	Faculty of Engineering (Helwan)	كلية الهندسة بحلوان	2026-01-24 15:58:22.359101	2026-01-24 15:58:22.359101
10	ENG_MAT	Faculty of Engineering (Mataria)	كلية الهندسة بالمطرية	2026-01-24 15:58:22.359101	2026-01-24 15:58:22.359101
11	FCAI	Faculty of Computers and Artificial Intelligence	كلية الحاسبات والذكاء الاصطناعي	2026-01-24 15:58:22.359101	2026-01-24 15:58:22.359101
12	APP_ARTS	Faculty of Applied Arts	كلية الفنون التطبيقية	2026-01-24 15:58:22.359101	2026-01-24 15:58:22.359101
13	FINE_ARTS	Faculty of Fine Arts	كلية الفنون الجميلة	2026-01-24 15:58:22.359101	2026-01-24 15:58:22.359101
14	ART_EDU	Faculty of Art Education	كلية التربية الفنية	2026-01-24 15:58:22.359101	2026-01-24 15:58:22.359101
15	MUS_EDU	Faculty of Music Education	كلية التربية الموسيقية	2026-01-24 15:58:22.359101	2026-01-24 15:58:22.359101
16	SOC_WORK	Faculty of Social Work	كلية الخدمة الاجتماعية	2026-01-24 15:58:22.359101	2026-01-24 15:58:22.359101
17	TOUR_HOTEL	Faculty of Tourism and Hotels	كلية السياحة والفنادق	2026-01-24 15:58:22.359101	2026-01-24 15:58:22.359101
18	PE_BOYS	Faculty of Physical Education (Boys)	كلية التربية الرياضية للبنين	2026-01-24 15:58:22.359101	2026-01-24 15:58:22.359101
19	PE_GIRLS	Faculty of Physical Education (Girls)	كلية التربية الرياضية للبنات	2026-01-24 15:58:22.359101	2026-01-24 15:58:22.359101
20	HOME_ECON	Faculty of Home Economics	كلية الاقتصاد المنزلي	2026-01-24 15:58:22.359101	2026-01-24 15:58:22.359101
21	TECH_EDU	Faculty of Technology and Education	كلية التكنولوجيا والتعليم	2026-01-24 15:58:22.359101	2026-01-24 15:58:22.359101
22	LAWW	Law	القانون	2026-02-10 18:05:04.353412	2026-02-10 18:05:04.353412
\.


--
-- Data for Name: field_operating_hours; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.field_operating_hours (id, field_id, day_of_week, opening_time, closing_time, created_at) FROM stdin;
\.


--
-- Data for Name: fields; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fields (id, name_en, name_ar, description_en, description_ar, sport_id, capacity, branch_id, status, hourly_rate, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: media_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.media_posts (id, title, description, category, images, "videoUrl", "videoDuration", date, created_at, updated_at) FROM stdin;
1	New Team	New Team 11 Member From Must Good Members	صور	/uploads/images-1771232528178-347868792.jpg		\N	2026-02-16 11:02:08.182	2026-02-16 09:02:09.860526	2026-02-16 09:02:09.860526
2	new	New New	صور	/uploads/images-1771232578280-887378254.jpeg,/uploads/images-1771232578292-811968382.jpeg		\N	2026-02-16 11:02:58.296	2026-02-16 09:03:00.084156	2026-02-16 09:03:00.084156
3	sports	new sport alert	صور	/uploads/images-1771415763428-362166352.jpg		\N	2026-02-18 13:56:03.43	2026-02-18 11:56:06.024445	2026-02-18 11:56:06.024445
4	New Post	wertyuiopiuyrewertyuuytree	عرض ترويجي	/uploads/images-1771601916257-50229832.jpg		\N	2026-02-20 17:38:36.261	2026-02-20 15:38:38.485949	2026-02-20 15:38:38.485949
5	wqwertrewer	zxnmgfdsdfghjgfdfghj	إعلان	/uploads/images-1771602235397-432769962.jpg		\N	2026-02-20 17:43:55.399	2026-02-20 15:43:57.689696	2026-02-20 15:43:57.689696
6	~سشسيشسيشسيب	شسيشسيشسيشسيشسيشسيشسيشسيشسيشيشسيشيشسيشسيشسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسسشششششششششش	أخبار	/uploads/images-1771613573756-149598988.jpg		\N	2026-02-20 20:52:53.797	2026-02-20 18:52:56.04723	2026-02-20 18:52:56.04723
8	الحياة مكنتش حلوه امبارح	يارب الحياه تبقى حلوه بكره	صور	/uploads/images-1771801837599-240490286.png		\N	2026-02-23 01:10:37.604	2026-02-22 23:10:39.228688	2026-02-22 23:10:39.228688
\.


--
-- Data for Name: member_memberships; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.member_memberships (id, member_id, membership_plan_id, start_date, end_date, status, payment_status, created_at, updated_at) FROM stdin;
1	6	1	2026-01-26	2027-01-21	active	pending	2026-01-25 23:49:21.090516	2026-01-25 23:49:21.090516
2	57	113	2026-02-17	2027-02-17	active	paid	2026-02-17 16:24:57.733756	2026-02-17 16:24:57.733756
3	63	119	2026-02-17	2027-02-17	active	paid	2026-02-17 20:20:09.23659	2026-02-17 20:20:09.23659
4	68	113	2026-02-17	2027-02-17	active	paid	2026-02-17 21:05:14.770126	2026-02-17 21:05:14.770126
5	69	113	2026-02-17	2027-02-17	active	paid	2026-02-17 21:07:51.887385	2026-02-17 21:07:51.887385
6	71	121	2026-02-18	2026-05-18	active	paid	2026-02-17 23:24:08.149068	2026-02-17 23:24:08.149068
7	77	120	2026-02-18	2027-02-18	active	paid	2026-02-17 23:45:46.495733	2026-02-17 23:45:46.495733
8	78	119	2026-02-18	2027-02-18	active	paid	2026-02-17 23:47:34.706059	2026-02-17 23:47:34.706059
9	81	113	2026-02-18	2027-02-18	active	paid	2026-02-18 11:09:05.933603	2026-02-18 11:09:05.933603
10	82	119	2026-02-19	2027-02-19	active	paid	2026-02-19 08:30:04.477935	2026-02-19 08:30:04.477935
11	83	119	2026-02-19	2027-02-19	active	paid	2026-02-19 10:52:35.257683	2026-02-19 10:52:35.257683
12	84	119	2026-02-19	2027-02-19	active	paid	2026-02-19 11:10:47.006561	2026-02-19 11:10:47.006561
13	85	119	2026-02-19	2027-02-19	active	paid	2026-02-19 11:17:29.772225	2026-02-19 11:17:29.772225
14	86	119	2026-02-19	2027-02-19	active	paid	2026-02-19 11:28:53.535112	2026-02-19 11:28:53.535112
15	87	119	2026-02-19	2027-02-19	active	paid	2026-02-19 11:41:46.955647	2026-02-19 11:41:46.955647
16	88	119	2026-02-19	2027-02-19	active	paid	2026-02-19 11:52:47.427401	2026-02-19 11:52:47.427401
17	89	119	2026-02-19	2027-02-19	active	paid	2026-02-19 12:08:24.493441	2026-02-19 12:08:24.493441
18	90	113	2026-02-20	2027-02-20	active	paid	2026-02-20 15:00:21.848758	2026-02-20 15:00:21.848758
19	91	113	2026-02-20	2027-02-20	active	paid	2026-02-20 15:02:19.757517	2026-02-20 15:02:19.757517
20	92	119	2026-02-20	2027-02-20	active	paid	2026-02-20 15:04:52.0901	2026-02-20 15:04:52.0901
21	93	119	2026-02-20	2027-02-20	active	paid	2026-02-20 18:13:19.543403	2026-02-20 18:13:19.543403
22	94	113	2026-02-20	2027-02-20	active	paid	2026-02-20 18:30:36.200516	2026-02-20 18:30:36.200516
23	95	119	2026-02-20	2027-02-20	active	paid	2026-02-20 21:29:14.409413	2026-02-20 21:29:14.409413
25	100	119	2026-02-21	2027-02-21	active	paid	2026-02-21 10:05:14.147308	2026-02-21 10:05:14.147308
26	102	119	2026-02-21	2027-02-21	active	paid	2026-02-21 15:40:12.035831	2026-02-21 15:40:12.035831
27	103	113	2026-02-21	2027-02-21	active	pending	2026-02-21 18:04:09.154125	2026-02-21 18:04:09.154125
28	103	113	2026-02-21	2027-02-21	active	paid	2026-02-21 18:04:12.100656	2026-02-21 18:04:12.100656
29	104	113	2026-02-21	2027-02-21	active	pending	2026-02-21 18:12:57.685821	2026-02-21 18:12:57.685821
30	104	113	2026-02-21	2027-02-21	active	paid	2026-02-21 18:12:59.785921	2026-02-21 18:12:59.785921
31	106	113	2026-02-21	2027-02-21	active	pending	2026-02-21 18:23:36.922938	2026-02-21 18:23:36.922938
32	106	119	2026-02-21	2027-02-21	active	paid	2026-02-21 18:23:39.057603	2026-02-21 18:23:39.057603
33	107	113	2026-02-21	2027-02-21	active	pending	2026-02-21 18:30:01.322797	2026-02-21 18:30:01.322797
34	107	113	2026-02-21	2027-02-21	active	paid	2026-02-21 18:30:03.354534	2026-02-21 18:30:03.354534
35	108	113	2026-02-21	2027-02-21	active	pending	2026-02-21 18:36:15.008918	2026-02-21 18:36:15.008918
36	108	113	2026-02-21	2027-02-21	active	paid	2026-02-21 18:36:16.835005	2026-02-21 18:36:16.835005
37	109	113	2026-02-21	2027-02-21	active	pending	2026-02-21 18:45:08.212674	2026-02-21 18:45:08.212674
38	109	113	2026-02-21	2027-02-21	active	paid	2026-02-21 18:45:09.878488	2026-02-21 18:45:09.878488
39	110	113	2026-02-21	2027-02-21	active	pending	2026-02-21 18:54:28.197894	2026-02-21 18:54:28.197894
40	110	113	2026-02-21	2027-02-21	active	paid	2026-02-21 18:54:30.022165	2026-02-21 18:54:30.022165
41	111	113	2026-02-21	2027-02-21	active	pending	2026-02-21 19:25:39.633859	2026-02-21 19:25:39.633859
42	111	113	2026-02-21	2027-02-21	active	paid	2026-02-21 19:25:42.651798	2026-02-21 19:25:42.651798
43	112	119	2026-02-21	2027-02-21	active	paid	2026-02-21 19:35:29.755303	2026-02-21 19:35:29.755303
44	113	119	2026-02-21	2027-02-21	active	pending	2026-02-21 19:53:14.305091	2026-02-21 19:53:14.305091
45	113	119	2026-02-21	2027-02-21	active	paid	2026-02-21 19:53:16.431781	2026-02-21 19:53:16.431781
46	114	113	2026-02-21	2027-02-21	active	pending	2026-02-21 19:56:47.778695	2026-02-21 19:56:47.778695
47	114	113	2026-02-21	2027-02-21	active	paid	2026-02-21 19:56:49.576128	2026-02-21 19:56:49.576128
48	115	120	2026-02-21	2027-02-21	active	pending	2026-02-21 20:02:26.634507	2026-02-21 20:02:26.634507
49	115	120	2026-02-21	2027-02-21	active	paid	2026-02-21 20:02:32.524988	2026-02-21 20:02:32.524988
50	116	121	2026-02-21	2026-05-21	active	pending	2026-02-21 20:10:53.494865	2026-02-21 20:10:53.494865
51	117	121	2026-02-21	2026-05-21	active	pending	2026-02-21 20:13:00.688602	2026-02-21 20:13:00.688602
52	118	121	2026-02-21	2026-05-21	active	pending	2026-02-21 20:21:19.524921	2026-02-21 20:21:19.524921
53	118	121	2026-02-21	2026-05-21	active	paid	2026-02-21 20:21:21.706962	2026-02-21 20:21:21.706962
54	119	113	2026-02-21	2027-02-21	active	pending	2026-02-21 20:23:39.117345	2026-02-21 20:23:39.117345
55	119	113	2026-02-21	2027-02-21	active	paid	2026-02-21 20:23:41.49124	2026-02-21 20:23:41.49124
56	120	113	2026-02-21	2027-02-21	active	pending	2026-02-21 20:31:50.620175	2026-02-21 20:31:50.620175
57	120	113	2026-02-21	2027-02-21	active	paid	2026-02-21 20:31:52.553244	2026-02-21 20:31:52.553244
58	121	113	2026-02-21	2027-02-21	active	pending	2026-02-21 20:36:21.333427	2026-02-21 20:36:21.333427
59	121	113	2026-02-21	2027-02-21	active	paid	2026-02-21 20:36:23.339918	2026-02-21 20:36:23.339918
60	122	113	2026-02-21	2027-02-21	active	pending	2026-02-21 20:42:22.291982	2026-02-21 20:42:22.291982
61	122	113	2026-02-21	2027-02-21	active	paid	2026-02-21 20:42:24.262488	2026-02-21 20:42:24.262488
62	123	113	2026-02-21	2027-02-21	active	pending	2026-02-21 20:52:29.932461	2026-02-21 20:52:29.932461
63	123	113	2026-02-21	2027-02-21	active	paid	2026-02-21 20:52:32.096764	2026-02-21 20:52:32.096764
64	124	119	2026-02-21	2027-02-21	active	paid	2026-02-21 20:56:02.756875	2026-02-21 20:56:02.756875
65	125	113	2026-02-21	2027-02-21	active	pending	2026-02-21 20:56:15.269212	2026-02-21 20:56:15.269212
66	125	113	2026-02-21	2027-02-21	active	paid	2026-02-21 20:56:17.238834	2026-02-21 20:56:17.238834
67	126	113	2026-02-21	2027-02-21	active	pending	2026-02-21 21:00:36.01239	2026-02-21 21:00:36.01239
68	126	113	2026-02-21	2027-02-21	active	paid	2026-02-21 21:00:38.074268	2026-02-21 21:00:38.074268
69	128	119	2026-02-21	2027-02-21	active	paid	2026-02-21 21:04:48.663244	2026-02-21 21:04:48.663244
70	129	113	2026-02-21	2027-02-21	active	pending	2026-02-21 21:12:36.800046	2026-02-21 21:12:36.800046
71	129	113	2026-02-21	2027-02-21	active	paid	2026-02-21 21:12:39.393118	2026-02-21 21:12:39.393118
72	130	119	2026-02-21	2027-02-21	active	paid	2026-02-21 21:16:28.646259	2026-02-21 21:16:28.646259
73	131	113	2026-02-21	2027-02-21	active	pending	2026-02-21 21:31:16.623971	2026-02-21 21:31:16.623971
74	131	113	2026-02-21	2027-02-21	active	paid	2026-02-21 21:31:18.919297	2026-02-21 21:31:18.919297
75	132	113	2026-02-21	2027-02-21	active	paid	2026-02-21 21:33:07.002206	2026-02-21 21:33:07.002206
76	133	113	2026-02-21	2027-02-21	active	pending	2026-02-21 21:38:46.746038	2026-02-21 21:38:46.746038
77	133	113	2026-02-21	2027-02-21	active	paid	2026-02-21 21:38:48.833025	2026-02-21 21:38:48.833025
78	134	113	2026-02-21	2027-02-21	active	paid	2026-02-21 21:42:11.884785	2026-02-21 21:42:11.884785
79	135	113	2026-02-22	2027-02-22	active	pending	2026-02-21 22:40:23.938312	2026-02-21 22:40:23.938312
80	136	113	2026-02-22	2027-02-22	active	pending	2026-02-21 22:41:26.123234	2026-02-21 22:41:26.123234
81	136	113	2026-02-22	2027-02-22	active	paid	2026-02-21 22:41:27.635035	2026-02-21 22:41:27.635035
82	137	119	2026-02-22	2027-02-22	active	pending	2026-02-21 22:43:49.253569	2026-02-21 22:43:49.253569
83	137	119	2026-02-22	2027-02-22	active	paid	2026-02-21 22:43:50.922118	2026-02-21 22:43:50.922118
84	138	120	2026-02-22	2027-02-22	active	pending	2026-02-21 22:51:09.916613	2026-02-21 22:51:09.916613
85	139	120	2026-02-22	2027-02-22	active	pending	2026-02-21 22:52:30.5962	2026-02-21 22:52:30.5962
86	140	120	2026-02-22	2027-02-22	active	pending	2026-02-21 22:53:20.54367	2026-02-21 22:53:20.54367
87	141	120	2026-02-22	2027-02-22	active	pending	2026-02-21 22:54:13.751705	2026-02-21 22:54:13.751705
88	142	120	2026-02-22	2027-02-22	active	pending	2026-02-21 23:21:03.692278	2026-02-21 23:21:03.692278
89	143	120	2026-02-22	2027-02-22	active	pending	2026-02-21 23:21:51.84257	2026-02-21 23:21:51.84257
90	144	121	2026-02-22	2026-05-22	active	pending	2026-02-21 23:36:05.146503	2026-02-21 23:36:05.146503
91	144	121	2026-02-22	2026-05-22	active	paid	2026-02-21 23:36:06.910662	2026-02-21 23:36:06.910662
92	145	113	2026-02-22	2027-02-22	active	pending	2026-02-21 23:42:25.614385	2026-02-21 23:42:25.614385
93	145	113	2026-02-22	2027-02-22	active	paid	2026-02-21 23:42:27.313144	2026-02-21 23:42:27.313144
94	146	113	2026-02-22	2027-02-22	active	pending	2026-02-22 04:06:58.250897	2026-02-22 04:06:58.250897
95	146	113	2026-02-22	2027-02-22	active	paid	2026-02-22 04:06:59.497597	2026-02-22 04:06:59.497597
96	147	113	2026-02-22	2027-02-22	active	pending	2026-02-22 20:10:52.584841	2026-02-22 20:10:52.584841
97	147	113	2026-02-22	2027-02-22	active	paid	2026-02-22 20:10:54.629138	2026-02-22 20:10:54.629138
98	148	113	2026-02-24	2027-02-24	active	pending	2026-02-24 00:50:18.81992	2026-02-24 00:50:18.81992
99	148	113	2026-02-24	2027-02-24	active	paid	2026-02-24 00:50:19.871775	2026-02-24 00:50:19.871775
100	149	113	2026-02-24	2027-02-24	active	pending	2026-02-24 00:53:13.761556	2026-02-24 00:53:13.761556
101	149	113	2026-02-24	2027-02-24	active	paid	2026-02-24 00:53:14.859748	2026-02-24 00:53:14.859748
102	150	113	2026-02-24	2027-02-24	active	pending	2026-02-24 12:32:55.806135	2026-02-24 12:32:55.806135
103	151	113	2026-02-24	2027-02-24	active	pending	2026-02-24 12:33:54.549611	2026-02-24 12:33:54.549611
104	151	113	2026-02-24	2027-02-24	active	paid	2026-02-24 12:33:55.645896	2026-02-24 12:33:55.645896
105	152	119	2026-02-24	2027-02-24	active	pending	2026-02-24 13:21:40.059352	2026-02-24 13:21:40.059352
106	153	113	2026-02-24	2027-02-24	active	pending	2026-02-24 13:47:03.772725	2026-02-24 13:47:03.772725
107	153	113	2026-02-24	2027-02-24	active	paid	2026-02-24 13:47:05.531896	2026-02-24 13:47:05.531896
108	154	113	2026-02-24	2027-02-24	active	pending	2026-02-24 14:45:11.841433	2026-02-24 14:45:11.841433
109	154	113	2026-02-24	2027-02-24	active	paid	2026-02-24 14:45:13.493448	2026-02-24 14:45:13.493448
110	155	119	2026-02-24	2027-02-24	active	pending	2026-02-24 14:46:48.470791	2026-02-24 14:46:48.470791
111	155	119	2026-02-24	2027-02-24	active	paid	2026-02-24 14:46:49.759486	2026-02-24 14:46:49.759486
112	156	119	2026-02-24	2027-02-24	active	pending	2026-02-24 18:42:06.397335	2026-02-24 18:42:06.397335
113	156	119	2026-02-24	2027-02-24	active	paid	2026-02-24 18:42:07.991702	2026-02-24 18:42:07.991702
114	157	121	2026-02-24	2026-05-24	active	pending	2026-02-24 19:24:09.098495	2026-02-24 19:24:09.098495
115	157	121	2026-02-24	2026-05-24	active	paid	2026-02-24 19:24:10.742779	2026-02-24 19:24:10.742779
116	158	113	2026-02-25	2027-02-25	active	pending	2026-02-24 23:18:02.433392	2026-02-24 23:18:02.433392
117	158	113	2026-02-25	2027-02-25	active	paid	2026-02-24 23:18:03.529113	2026-02-24 23:18:03.529113
118	159	113	2026-02-25	2027-02-25	active	pending	2026-02-25 02:28:55.989496	2026-02-25 02:28:55.989496
119	159	113	2026-02-25	2027-02-25	active	paid	2026-02-25 02:29:04.546862	2026-02-25 02:29:04.546862
120	160	113	2026-02-25	2027-02-25	active	pending	2026-02-25 04:27:56.068922	2026-02-25 04:27:56.068922
121	160	113	2026-02-25	2027-02-25	active	paid	2026-02-25 04:28:03.553403	2026-02-25 04:28:03.553403
122	161	119	2026-03-01	2027-03-01	active	pending	2026-03-01 03:00:06.324672	2026-03-01 03:00:06.324672
123	162	119	2026-03-01	2027-03-01	active	pending	2026-03-01 03:04:58.029378	2026-03-01 03:04:58.029378
124	163	119	2026-03-01	2027-03-01	active	pending	2026-03-01 11:59:58.20194	2026-03-01 11:59:58.20194
125	163	119	2026-03-01	2027-03-01	active	paid	2026-03-01 12:00:06.686106	2026-03-01 12:00:06.686106
126	164	119	2026-03-01	2027-03-01	active	pending	2026-03-01 18:03:55.006475	2026-03-01 18:03:55.006475
127	164	119	2026-03-01	2027-03-01	active	paid	2026-03-01 18:04:39.205521	2026-03-01 18:04:39.205521
128	165	119	2026-03-01	2027-03-01	active	pending	2026-03-01 18:42:50.565518	2026-03-01 18:42:50.565518
129	165	119	2026-03-01	2027-03-01	active	paid	2026-03-01 18:43:23.825862	2026-03-01 18:43:23.825862
130	166	119	2026-03-01	2027-03-01	active	pending	2026-03-01 19:50:42.887741	2026-03-01 19:50:42.887741
131	166	119	2026-03-01	2027-03-01	active	paid	2026-03-01 19:50:55.544466	2026-03-01 19:50:55.544466
\.


--
-- Data for Name: member_relationships; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.member_relationships (id, member_id, related_member_id, relationship_type, is_dependent, age_group, created_at, relationship_name_ar) FROM stdin;
1	77	70	spouse	t	\N	2026-02-17 23:45:45.889192	\N
2	115	70	child	t	\N	2026-02-21 20:02:31.554958	\N
\.


--
-- Data for Name: member_team_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.member_team_subscriptions (id, member_id, team_id, created_by_staff_id, approved_by_staff_id, announcement_id, status, decline_reason, cancellation_reason, start_date, end_date, approved_at, declined_at, cancelled_at, monthly_fee, registration_fee, discount_amount, custom_price, payment_status, approval_notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: member_teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.member_teams (id, team_id, member_id, created_at, start_date, end_date, status, price) FROM stdin;
3	8	146	2026-02-23 07:53:05.507852	2026-02-23	\N	pending	0.00
4	7	146	2026-02-23 07:53:06.335472	2026-02-23	\N	pending	0.00
5	10	145	2026-02-23 07:53:57.01161	2026-02-23	\N	pending	0.00
6	7	145	2026-02-23 07:53:57.808687	2026-02-23	\N	pending	0.00
7	8	145	2026-02-23 07:53:58.603596	2026-02-23	\N	pending	0.00
8	6	145	2026-02-23 07:53:59.316656	2026-02-23	\N	pending	0.00
9	8	27	2026-02-23 07:54:16.85597	2026-02-23	\N	pending	0.00
10	8	144	2026-02-23 08:15:03.659975	2026-02-23	\N	pending	0.00
11	10	149	2026-02-24 03:18:18.469277	2026-02-24	\N	pending	0.00
12	8	149	2026-02-24 03:18:18.970317	2026-02-24	\N	pending	0.00
13	5	149	2026-02-24 03:18:19.460481	2026-02-24	\N	pending	0.00
14	5	149	2026-02-24 03:18:19.559124	2026-02-24	\N	pending	0.00
15	7	149	2026-02-24 03:30:38.199486	2026-02-24	\N	pending	0.00
16	10	151	2026-02-24 13:18:08.576718	2026-02-24	\N	pending	0.00
17	8	151	2026-02-24 13:18:09.400196	2026-02-24	\N	pending	0.00
18	10	159	2026-02-25 03:22:55.809673	2026-02-25	\N	pending	0.00
19	8	159	2026-02-25 03:22:56.800902	2026-02-25	\N	pending	0.00
20	10	158	2026-02-25 03:26:52.369682	2026-02-25	\N	pending	0.00
21	8	158	2026-02-25 03:26:53.030772	2026-02-25	\N	pending	0.00
22	7	158	2026-02-25 03:32:34.559693	2026-02-25	\N	pending	0.00
23	5	158	2026-02-25 03:32:35.257466	2026-02-25	\N	pending	0.00
24	6	158	2026-02-25 03:32:35.906498	2026-02-25	\N	pending	0.00
25	3	158	2026-02-25 03:32:55.872191	2026-02-25	\N	approved	0.00
26	13	160	2026-02-25 04:52:48.403133	2026-02-25	\N	pending	0.00
27	10	160	2026-02-25 04:52:49.653697	2026-02-25	\N	pending	0.00
28	8	160	2026-02-25 04:52:51.077601	2026-02-25	\N	pending	0.00
29	7	160	2026-02-25 04:52:52.127663	2026-02-25	\N	pending	0.00
\.


--
-- Data for Name: member_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.member_types (id, code, name_en, name_ar, description_en, created_at, updated_at, description_ar) FROM stdin;
1	FOUNDER	Founder Member	العضو المؤسس	Founder member of the club with lifetime privileges	2026-01-24 15:50:07.693027	2026-01-24 15:50:07.693027	\N
2	WORKING	Working Member	العضو العامل	Employee of the university with salary-based pricing	2026-01-24 15:50:07.693027	2026-01-24 15:50:07.693027	\N
3	DEPENDENT	Dependent Member	العضو التابع	Spouse, children, or dependents of working members with 40% discount	2026-01-24 15:50:07.693027	2026-01-24 15:50:07.693027	\N
4	VISITOR	Visitor Member	العضو الزائر	Non-university member for annual visit to the club	2026-01-24 15:50:07.693027	2026-01-24 15:50:07.693027	\N
5	VISITOR_HONORARY	Visitor - Honorary	الزائر - فخري	Honorary visitor member approved by board	2026-01-24 15:50:07.693027	2026-01-24 15:50:07.693027	\N
6	VISITOR_ATHLETIC	Visitor - Athletic	الزائر - رياضي	Athletic visitor member for sports enthusiasts	2026-01-24 15:50:07.693027	2026-01-24 15:50:07.693027	\N
7	VISITOR_BRANCH	Visitor - Branch	الزائر - فرع	Visitor member from branch with limited access	2026-01-24 15:50:07.693027	2026-01-24 15:50:07.693027	\N
8	BRANCH	Branch Member	عضو الفرع	Member of club branch with full branch privileges	2026-01-24 15:50:07.693027	2026-01-24 15:50:07.693027	\N
9	SEASONAL	Seasonal Member	العضو الموسمى	Temporary member for up to 6 months duration	2026-01-24 15:50:07.693027	2026-01-24 15:50:07.693027	\N
10	ATHLETE	Athlete Member	العضو الرياضى	Distinguished athlete approved by board free membership	2026-01-24 15:50:07.693027	2026-01-24 15:50:07.693027	\N
11	HONORARY	Honorary Member	العضو الفخرى	Honorary member approved by board for 1 year free	2026-01-24 15:50:07.693027	2026-01-24 15:50:07.693027	\N
12	FOREIGNER	Foreigner Member	الأجنبي	Non-Egyptian member with flexible terms and USD pricing	2026-01-24 15:50:07.693027	2026-01-24 15:50:07.693027	\N
13	STUDENT	Student Member	عضو الطالب	University student member with fixed annual fee	2026-01-24 15:50:07.693027	2026-01-24 15:50:07.693027	\N
14	GRADUATE	Graduate Member	عضو الخريج	University graduate member with fixed annual fee	2026-01-24 15:50:07.693027	2026-01-24 15:50:07.693027	\N
15	REGULAR	Regular Member	عضو عادي	\N	2026-02-21 09:53:57.554402	2026-02-21 09:53:57.554402	\N
16	TEAM_MEMBER	Team Member	عضو فريق	\N	2026-02-21 09:53:58.358118	2026-02-21 09:53:58.358118	\N
17	RETIRED	Retired Member	عضو بالمعاش	\N	2026-02-21 09:53:58.788653	2026-02-21 09:53:58.788653	\N
18	EMPLOYEE	Employee Member	عضو موظف	\N	2026-02-21 09:53:59.225131	2026-02-21 09:53:59.225131	\N
\.


--
-- Data for Name: members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.members (id, account_id, first_name_en, first_name_ar, last_name_en, last_name_ar, national_id, gender, phone, nationality, birthdate, health_status, is_foreign, medical_report, member_type_id, points_balance, status, created_at, updated_at, national_id_front, national_id_back, address, photo) FROM stdin;
138	205	Kerolos	عضو تابع	Maged	Maged	45645655555555	male	01235555555	Egyptian	2019-12-30	\N	f	\N	3	0	pending	2026-02-21 22:51:09.916613	2026-02-21 22:51:09.916613	\N	\N	\N	\N
6	6	Marwan	مروان	Pablo	بابلوا	29001071234567	male	01012355678	Egyptian	1990-02-15	\N	f	\N	2	0	active	2026-01-25 23:49:21.090516	2026-01-25 23:49:21.090516	\N	\N	\N	\N
142	209	Kerolos	عضو تابع	Maged	Kero	78913222222222	male	01233333333	Egyptian	2016-07-14	\N	f	\N	3	0	active	2026-02-21 23:21:03.692278	2026-02-22 23:26:05.652196	\N	\N	\N	\N
28	39	da	محمد هشام	Mdadad	يي	21421467867867	male	01011379817	Egyptian	2026-02-19	\N	f	uploads\\medical_report-1770394726645-697623929.png	1	0	active	2026-02-06 16:18:45.405264	2026-02-06 16:18:47.271147	\N	\N	\N	\N
8	8	Mo123123	يارا النيجر	Mdoiawndoiawd	نيجر	1231241231234	male	0101337917	مصري	2026-01-24	\N	t	\N	1	0	active	2026-01-26 23:37:27.826727	2026-01-26 23:37:27.826727	\N	\N	\N	\N
9	9	Mohammed	محمد هشام	hessssssham	عبد المنعن	124123124123	male	01011379817	مصري	2026-01-09	\N	t	\N	1	0	active	2026-01-26 23:58:40.045431	2026-01-26 23:58:40.045431	\N	\N	\N	\N
10	10	Hossam	محمد	Mohammed	حسام	01010101011	male	0101338183	اجنبي	2026-01-20	\N	t	\N	1	0	active	2026-01-27 00:16:39.312098	2026-01-27 00:16:39.312098	\N	\N	\N	\N
11	11	Hossam	محمد	Mohammed	حسام	010101010113	male	0101338183	اجنبي	2026-01-20	\N	t	\N	1	0	active	2026-01-27 00:26:11.160167	2026-01-27 00:26:11.160167	\N	\N	\N	\N
12	12	hosham	محمد	Mohammeddddh	هشام	13212	male	01011347381	مصري	2026-01-13	\N	t	\N	1	0	active	2026-01-27 00:34:15.855043	2026-01-27 00:34:15.855043	\N	\N	\N	\N
13	13	do	محمد هشام	da	يي	124123	male	0101381	Egpyt	2026-01-23	\N	t	\N	1	0	active	2026-01-27 00:37:20.210906	2026-01-27 00:37:20.210906	\N	\N	\N	\N
29	40	dawd	dada	adawda	dada	31231231241241	male	01013712983	Egyptian	2026-02-18	\N	f	\N	1	0	active	2026-02-06 16:26:36.577522	2026-02-06 16:26:36.577522	\N	\N	\N	\N
15	18	Zeeyad	زياد	Player	لاعب	29912345678901	male	01234567890	Egyptian	1999-01-15	\N	f	uploads\\medical_report-1769530470739-863219542.png	1	0	active	2026-01-27 15:59:06.957428	2026-01-27 16:14:32.283081	\N	\N	1234 Main St	\N
14	14	ammmmed	موهامد	MOOOhamed	هوشام	51245123123123	male	010113798177	مصرى	2026-01-14	\N	t	uploads\\medical_report-1769530493576-589992833.png	1	0	active	2026-01-27 01:23:55.87173	2026-01-27 16:14:55.208868	\N	\N	1234 Main St	\N
16	19	Zeeyad	زياد	Player	لاعب	29912345678911	male	01234567890	Egyptian	1999-01-15	\N	f	uploads\\medical_report-1769615055465-581862182.png	1	0	active	2026-01-28 15:40:23.910932	2026-01-28 15:44:16.537206	\N	\N	Main 123	\N
17	20	Zeeyad	زياد	Player	لاعب	29912345679911	male	01234567890	Egyptian	1999-01-15	\N	f	uploads\\medical_report-1769620715591-459867508.png	1	0	active	2026-01-28 17:18:13.993448	2026-01-28 17:19:33.951404	\N	\N	Main 123	\N
18	21	dawd	awdawdawd	dawda	dawdawdawd	12412312412312	female	0101137987173	مصرى	2026-01-02	\N	t	\N	1	0	active	2026-01-30 16:38:15.093471	2026-01-30 16:38:15.093471	\N	\N	\N	\N
19	22	heshsammmmmmmm	Mohammed	Mohammmmmed	Etch	12341231241241	male	01011379817	مصرى	2026-01-28	\N	t	\N	1	0	active	2026-01-30 17:09:37.524576	2026-01-30 17:09:39.412028	\N	\N	Cairo	\N
20	23	xxda	yara	zzda	el gamda	123124124123	male	01011379817	مصرى	2026-01-07	\N	t	\N	1	0	active	2026-01-30 18:21:03.235669	2026-01-30 18:21:03.235669	\N	\N	\N	\N
21	24	moamdoa	محمد هشام	mohammed	عبد المنهم	123124123124	male	01011347397	Foreigner	2026-01-13	\N	t	\N	1	0	active	2026-01-30 18:37:02.208279	2026-01-30 18:37:02.208279	\N	\N	\N	\N
22	25	Hehsam	محمد	Mohammed	هشام	41241241241241	male	01131313141	Egyptian	2026-01-14	\N	f	\N	1	0	active	2026-01-30 18:45:06.270544	2026-01-30 18:45:07.156377	\N	\N	Cairo	\N
23	26	eawrarawd	dawdawr	rasradw	dawrawr	12412412412412	female	01010120101	Egyptian	2026-01-22	\N	f	\N	1	0	active	2026-01-30 21:35:38.972313	2026-01-30 21:35:38.972313	\N	\N	\N	\N
24	27	dawd	محمد هشااام	Momaodmoawd	محمد	31231412312412	male	01011379817	Egyptian	2026-01-06	\N	f	\N	1	0	active	2026-01-31 20:42:01.83092	2026-01-31 20:42:02.408266	\N	\N	10 الجنزوري	\N
25	28	eae	yarar	Yara el nigger	el nigger	14123124124124	male	01011379181	Egyptian	2026-02-11	\N	f	\N	1	0	active	2026-02-01 02:09:55.459328	2026-02-01 02:09:56.020792	\N	\N	Claofornaina	\N
26	29	daw	asd	wad	dwa	12412412312412	male	01011379181	Egyptian	2026-02-10	\N	f	\N	1	0	active	2026-02-01 02:13:55.104815	2026-02-01 02:13:55.601	\N	\N	Calo	\N
27	30	Staff player	لاعب ستاف	Staffffplayertwo	لاعب ستاف	12412312412412	male	01026165849	Egyptian	2026-02-20	\N	f	\N	1	0	active	2026-02-01 02:27:16.202025	2026-02-23 03:35:48.069	\N	\N	dadwdar	\N
30	41	awd	dawd	daw	awd	12412412411313	male	01013178171	Egyptian	2026-02-17	\N	f	uploads\\medical_report-1770395290275-165781427.png	1	0	active	2026-02-06 16:28:09.120687	2026-02-06 16:28:10.896727	\N	\N	\N	\N
31	42	dawdawdawd	dawd	dawd	dawd	14141241241231	male	01010101001	Egyptian	2026-02-17	\N	f	uploads\\medical_report-1770395517399-298683231.png	1	0	active	2026-02-06 16:31:56.227998	2026-02-06 16:31:58.061163	\N	\N	\N	\N
32	45	Zeeyad	زياد	Player	لاعب	29912345676911	male	01234567890	Egyptian	1999-01-15	\N	f	\N	1	0	active	2026-02-07 12:47:14.055577	2026-02-07 12:47:14.055577	\N	\N	\N	\N
33	46	Zeeyad	زياد	Player	لاعب	29912345677711	male	01234567890	Egyptian	1999-01-15	\N	f	\N	1	0	active	2026-02-07 13:29:31.055917	2026-02-07 13:29:31.055917	\N	\N	\N	\N
34	47	Zeeyad	زياد	Player	لاعب	29912345687711	male	01234567890	Egyptian	1999-01-15	\N	f	\N	1	0	active	2026-02-07 13:30:43.867315	2026-02-07 13:30:43.867315	\N	\N	\N	\N
35	48	Zeeyad	زياد	Player	لاعب	39912345687711	male	01234567890	Egyptian	1999-01-15	\N	f	\N	1	0	active	2026-02-07 13:44:49.346956	2026-02-07 13:44:49.346956	\N	\N	\N	\N
36	49	Test	اختبار	User	مستخدم	1234567890	M		Egyptian	\N	\N	f	\N	1	0	active	2026-02-10 14:10:10.821548	2026-02-10 14:10:10.821548	\N	\N	\N	\N
43	60	zeyad	علاء	alaa	زياد	32122222222222	male	0122222222222	مصرى	2008-06-10	\N	t	\N	1	0	active	2026-02-14 13:22:07.797527	2026-02-21 11:18:37.894656	\N	\N	Helwan	\N
38	55	Kerolos	كيرلس	Maged	ماجد	30303030303021	male	01210295054	Egyptian	2004-07-21	\N	f	\N	13	0	active	2026-02-14 12:09:56.929939	2026-02-14 12:09:56.929939	\N	\N	Helwan	\N
39	56	Kerolos	كيرلس	Maged	ماجد	30454545454545454	male	01211111111	مصرى	2015-02-03	\N	t	\N	1	0	active	2026-02-14 12:59:02.199372	2026-02-14 12:59:03.317284	\N	\N	Helwan	\N
40	57	Kerolos	كيرلس	Maged	ماجد	555554545454545454	male	01211111111	مصرى	2015-02-03	\N	t	\N	1	0	active	2026-02-14 13:00:11.447257	2026-02-14 13:00:11.995435	\N	\N	Helwan	\N
41	58	Kerolos	كيرلس	Maged	ماجد	9999999999954545454	male	01211111111	مصرى	2015-02-03	\N	t	\N	1	0	active	2026-02-14 13:06:56.582788	2026-02-14 13:08:11.775432	\N	\N	Helwan	\N
42	59	Kerolos	كيرلس	Maged	ماجد	3333333333354545454	male	01211111111	مصرى	2015-02-03	\N	t	\N	1	0	pending	2026-02-14 13:17:24.037976	2026-02-14 13:17:24.605212	\N	\N	Helwan	\N
45	62	Judy	جودي	Ahmed	احمد	12345678912345	female	010223456789	Egyptian	1999-04-15	\N	f	\N	4	0	active	2026-02-14 23:26:00.393445	2026-02-14 23:26:00.393445	\N	\N	wadi houf	\N
44	61	zeyad	علاء	alaa	زياد	77122222222222	male	0122222222222	مصرى	2008-06-10	\N	t	\N	1	0	active	2026-02-14 13:24:56.095968	2026-02-14 13:38:27.047797	\N	\N	Helwan	\N
47	64	Yara	يارا	Ahmed	احمد	12345678991234	female		Egyptian	1988-02-05	\N	f	\N	1	0	active	2026-02-14 23:35:46.011142	2026-02-14 23:35:46.011142	\N	\N		\N
46	63	awoirhioaw	محمد	modamo	يشيصي	10010310412040124012401240124012401240	male	0101137817	مصرى	2026-02-04	\N	t	\N	1	0	active	2026-02-14 23:33:07.075395	2026-02-15 22:03:00.70576	\N	\N	asdal;wd	\N
48	65	Mohammed	محمد	Heshaaam	هشااام	12412412412312	male	01011379817	Egyptian	2026-02-28	\N	f	uploads\\medical_report-1771114809611-90975257.png	1	0	active	2026-02-15 00:20:07.472439	2026-02-15 00:20:08.050835	uploads\\national_id_front-1771114809563-216625840.png	uploads\\national_id_back-1771114809593-682138550.png	10 el ganzori	\N
49	66	hamed	محمد	Mo	موحمد	12412312412412412412	male	01015348978	Foreigner	2025-07-16	\N	t	\N	1	0	active	2026-02-15 00:21:11.78456	2026-02-15 00:21:11.78456	\N	\N	\N	\N
50	67	Ahmed	محمدممميد	Mo	هشاانانام	41241231241241	male	01023156487	Egyptian	2026-02-05	\N	f	uploads\\medical_report-1771115118027-687443640.png	1	0	active	2026-02-15 00:25:15.878491	2026-02-15 00:25:16.47384	uploads\\national_id_front-1771115117976-246096285.png	uploads\\national_id_back-1771115117990-792712762.png	niga	\N
37	50	Updated	أحمد	Hassan	حسن	29801011234567	M	201001234567	Egyptian	1990-01-15	\N	f	https://example.com/docs/updated_medical.jpg	1	0	suspended	2026-02-10 14:43:07.531756	2026-02-17 22:31:20.898258	https://example.com/doc.pdf	https://example.com/docs/new_id_back.jpg	456 New Street, Cairo	\N
55	80	momo	مو	mo	مومو	12094918274982	male	01011231655	Egyptian	2004-12-25	\N	f	\N	1	0	pending	2026-02-17 01:24:01.240849	2026-02-17 01:24:01.240849	\N	\N	\N	\N
51	76	yara	يارا	ahmed	احمد	01234567890123	female	01013133131	Foreigner	1999-05-04	\N	t	\N	1	0	suspended	2026-02-16 10:23:25.031021	2026-02-17 22:54:30.249999	\N	\N	\N	\N
56	81	momo	شحيخشحصةي	momo	ةيحخشصةخحي	12412412312451	male	01065449849	Egyptian	1004-02-04	\N	f	\N	1	0	active	2026-02-17 01:25:27.074858	2026-02-17 13:03:05.553161	\N	\N	\N	\N
54	79	momo	مو	mo	مومو	12094918274981	male	01011231655	Egyptian	2004-12-25	\N	f	\N	1	0	active	2026-02-17 01:15:11.20481	2026-02-17 13:03:16.787731	\N	\N	\N	\N
52	77	Mohammed	محمد	Heshsaam	هشام	92187398127398	male	01016654648	Egyptian	2026-02-18	\N	f	\N	1	0	active	2026-02-17 00:51:01.925513	2026-02-17 13:06:43.516931	\N	\N	\N	\N
53	78	mawopdmoapwd	جحنشصحخيشصي	poawmdpoawmd	حخشصيحخشصي	92837891273891	male	01015116516	Egyptian	1899-09-29	\N	f	uploads\\medical_report-1771290303687-810915361.png	1	0	active	2026-02-17 01:05:02.770092	2026-02-17 15:50:02.209181	uploads\\national_id_front-1771290303626-289361062.png	uploads\\national_id_back-1771290303663-746362825.png	Cairooo	\N
57	85	Hesham	هشام	Maybe	مثلا	12345678901234	male	01023358547	Egyptian	1988-08-08	\N	f	uploads\\medical_report-1771345496560-68078245.png	1	0	pending	2026-02-17 16:24:54.850435	2026-02-17 16:24:57.117453	uploads\\national_id_front-1771345496453-825872768.png	uploads\\national_id_back-1771345496559-234329829.png	msh 3arfa	\N
58	86	Judy	جودي	Ahmed	احمد	14785236901234	female	01022345678	Egyptian	2005-05-05	\N	f	\N	1	0	pending	2026-02-17 16:28:16.598721	2026-02-17 16:28:16.598721	\N	\N	\N	\N
59	87	lllml	hhhh	jjjjj	kkkkpppp	12345678996302	male	01023358547	Egyptian	2005-04-04	\N	f	\N	1	0	pending	2026-02-17 16:44:48.767737	2026-02-17 16:44:48.767737	\N	\N	\N	\N
60	88	Yara	Yara	Ahmed	Ahmed	77788999445566	female	01023358888	Egyptian	2000-02-22	\N	f	\N	1	0	active	2026-02-17 17:00:37.93966	2026-02-21 11:06:04.9499	\N	\N	\N	\N
64	95	Younis	يونس	Ahmed	احمد	88996655447711	male	01022345678	Egyptian	2000-09-09	\N	f	\N	1	0	active	2026-02-17 20:29:56.294074	2026-02-21 11:05:09.367547	\N	\N	\N	\N
61	89	Yara	Yara	Ahmed	Ahmed	77788999445567	female	01023358888	Egyptian	2000-02-22	\N	f	\N	1	0	active	2026-02-17 17:08:32.227009	2026-02-21 11:06:18.627596	\N	\N	\N	\N
70	101	Yara	Yara	Ahmed	Ahmed	99887744556633	male	01022345678	Foreigner	2000-08-08	\N	t	\N	1	0	pending	2026-02-17 21:08:44.272376	2026-02-17 21:08:44.272376	\N	\N	\N	\N
107	173	Yara	Yara	Ahmed	Ahmed	99663388552243	female	01022345678	Egyptian	0996-02-26	\N	f	uploads\\medical_report-1771698603171-199893427.png	1	0	pending	2026-02-21 18:30:01.322797	2026-02-21 18:30:02.737662	uploads\\national_id_front-1771698603075-493656594.png	uploads\\national_id_back-1771698603075-958952840.png	wadi houf	\N
72	104	Yara	Yara	Ahmed	Ahmed	22002200331144	female	01022345678	Egyptian	1999-02-22	\N	f	\N	1	0	pending	2026-02-17 23:25:55.539101	2026-02-17 23:25:55.539101	\N	\N	\N	\N
73	105	Yara	Yara	Ahmed	Ahmed	22002200331145	female	01022345678	Egyptian	1999-02-22	\N	f	\N	1	0	pending	2026-02-17 23:28:50.890184	2026-02-17 23:28:50.890184	\N	\N	\N	\N
74	106	Yara	Yara	Ahmed	Ahmed	88997744665511	female	01022345678	Egyptian	1788-08-08	\N	f	\N	1	0	pending	2026-02-17 23:36:55.818181	2026-02-17 23:36:55.818181	\N	\N	\N	\N
75	107	Yara	Yara	Ahmed	Ahmed	88997744665517	female	01022345678	Egyptian	1788-08-08	\N	f	\N	1	0	pending	2026-02-17 23:40:54.29987	2026-02-17 23:40:54.29987	\N	\N	\N	\N
76	108	Yara	kkk	Ahmed	Ahmed	88997744665515	female	01022345678	Egyptian	1788-08-08	\N	f	\N	1	0	pending	2026-02-17 23:44:09.753476	2026-02-17 23:44:09.753476	\N	\N	\N	\N
77	109	Yara	kkk	Ahmed	Ahmed	88997744665513	female	01022345678	Egyptian	1788-08-08	\N	f	uploads\\medical_report-1771371943568-994654900.png	1	0	pending	2026-02-17 23:45:43.820817	2026-02-17 23:45:45.498923	uploads\\national_id_front-1771371943492-568542480.png	uploads\\national_id_back-1771371943534-756951259.png	\N	\N
79	111	Zeyad	Zeyad	Zeyad	Zeyad	99661144557722	male	01151031404	Egyptian	2026-02-01	\N	f	\N	1	0	active	2026-02-18 09:14:27.885469	2026-02-18 09:14:27.885469	\N	\N	asdfghjklkjgfdfgh	\N
78	110	Yara	Yara	Ahmed	Ahmed	99663388552244	female	01022345678	Egyptian	2007-07-07	\N	f	uploads\\medical_report-1771372050485-362235289.png	1	0	active	2026-02-17 23:47:30.873396	2026-02-18 00:38:56.718516	\N	\N	\N	\N
80	112	kkkkkk	Jaaaa	kkkkkk	Jaaaa	775533662211	female	01151031404	Egyptian	2000-02-01	\N	f	\N	1	0	active	2026-02-18 09:17:31.959991	2026-02-18 09:17:31.959991	\N	\N	asdfghjklkjgfdfgh	\N
67	98	uuu	kkK	ppp	lll	22331144556699	male	01022345678	Egyptian	2000-02-22	\N	f	\N	1	0	active	2026-02-17 21:00:58.844402	2026-02-19 22:27:52.711072	\N	\N	\N	\N
68	99	mm	pp	nnn	ll	77885544112299	male	01022345678	Egyptian	2000-04-04	\N	f	uploads\\medical_report-1771362312971-983442660.png	1	0	active	2026-02-17 21:05:12.967958	2026-02-21 02:03:04.466654	uploads\\national_id_front-1771362312792-794789207.png	uploads\\national_id_back-1771362312792-370290144.png	wadi houf	\N
65	96	skskks	jsjsj	ppp	ncnncjs	99778855446611	male	01022345678	Egyptian	2000-07-07	\N	f	\N	1	0	active	2026-02-17 20:51:27.434838	2026-02-21 11:05:12.884965	\N	\N	\N	\N
62	90	Yara	Yara	Ahmed	Ahmed	77788999445544	female	01023358888	Egyptian	2000-02-22	\N	f	\N	1	0	active	2026-02-17 17:17:32.06117	2026-02-21 11:05:32.168215	\N	\N	\N	\N
63	94	Yara	Yaraah	Ahmed	Ahmed	22113344556677	female	01022345678	Egyptian	1999-09-09	\N	f	uploads\\medical_report-1771359607209-6544898.png	1	0	active	2026-02-17 20:20:05.133815	2026-02-21 11:05:38.403321	uploads\\national_id_front-1771359606099-403882433.png	uploads\\national_id_back-1771359606458-378131260.png	wadi houf	\N
66	97	kk	mm	ll	kk	99887744556611	male	01022345678	Egyptian	2000-04-04	\N	f	\N	1	0	active	2026-02-17 20:58:02.796083	2026-02-21 11:06:07.731651	\N	\N	\N	\N
69	100	Yara	Yara	Ahmed	Ahmed	99887744112255	male	01022345678	Egyptian	1999-09-09	\N	f	uploads\\medical_report-1771362469751-899738889.png	1	0	active	2026-02-17 21:07:50.097137	2026-02-21 11:06:11.342807	uploads\\national_id_front-1771362469610-206012012.png	uploads\\national_id_back-1771362469637-22335766.png	wadi houf	\N
139	206	Kerolos	عضو تابع	Maged	Maged	45645655555550	male	01235555555	Egyptian	2019-12-30	\N	f	\N	3	0	pending	2026-02-21 22:52:30.5962	2026-02-21 22:52:30.5962	\N	\N	\N	\N
81	113	VIP Zed	VIP Zed	VIP Zed	alaa	11559966332244	male	01151031404	Egyptian	2000-05-05	\N	f	uploads\\medical_report-1771412944396-345203305.jpg	1	0	active	2026-02-18 11:09:03.945182	2026-02-18 11:59:46.95504	uploads\\national_id_front-1771412944394-519648058.jpg	uploads\\national_id_back-1771412944394-899783983.jpg	El-Shareef, Hadayek Helwan, El Masara, Cairo Governorate	\N
92	135	awdawd	dadad	awdawdaw	adadaw	33333333333331	male	01011379817	Egyptian	2026-02-05	\N	f	uploads\\medical_report-1771599887423-817392106.png	1	0	active	2026-02-20 15:04:48.224604	2026-02-20 15:07:06.949386	\N	\N	\N	\N
82	120	RRRRR	ررررر	RRRRR	ررررر	00112233445566	male	01112713532	Egyptian	2025-10-13	\N	f	uploads\\medical_report-1771489802119-627646663.jpg	1	0	active	2026-02-19 08:30:02.345505	2026-02-19 09:05:13.341609	\N	\N	\N	\N
83	121	RRRRR	ررررر	RRRRR	ررررر	00112233445577	male	01112713532	Egyptian	2025-10-13	\N	f	uploads\\medical_report-1771498352449-86910580.jpg	1	0	pending	2026-02-19 10:52:33.00239	2026-02-19 10:52:33.687825	\N	\N	\N	\N
84	122	RRRRR	ررررر	RRRRR	ررررر	00012233445599	male	01112713532	Egyptian	2025-10-13	\N	f	uploads\\medical_report-1771499444262-821069194.jpg	1	0	pending	2026-02-19 11:10:44.942695	2026-02-19 11:10:45.523274	\N	\N	\N	\N
99	151	Ahmed	احمد	Mohammed	محمد	70065432100011	male	01200000000	Egyptian	2026-02-01	\N	f	uploads\\medical_report-1771668098330-573826294.png	8	0	active	2026-02-21 10:01:39.447037	2026-02-21 11:11:20.01062	\N	\N	\N	\N
86	124	RRRRR	ررررر	RRRRR	ررررر	07012243445599	male	01112713532	Egyptian	2025-10-13	\N	f	uploads\\medical_report-1771500530244-588243399.jpg	1	0	pending	2026-02-19 11:28:50.991603	2026-02-19 11:28:51.864941	\N	\N	\N	\N
105	171	Mohamed	محمد	Hossam	حسام	30404042106095	male	01154880915	Egyptian	2004-04-04	\N	f	\N	1	0	active	2026-02-21 18:13:38.226505	2026-02-24 04:43:56.388667	\N	\N	Giza, Egypt	\N
101	165	awdad	dasdawa	awdadad	dawdawd	11111111111212	male	01091884730	Egyptian	2026-02-04	\N	f	uploads\\medical_report-1771678681518-758006878.png	3	0	active	2026-02-21 12:58:01.626371	2026-02-21 13:16:56.32103	\N	\N	\N	\N
100	152	Ahmed	احمد	Mohammed	محمد	70065432100012	male	01200000000	Egyptian	2026-02-01	\N	f	uploads\\medical_report-1771668309367-222290439.png	13	0	active	2026-02-21 10:05:10.535582	2026-02-21 10:06:11.707782	\N	\N	\N	\N
98	150	Ahmed	احمد	Mohammed	محمد	70065432100000	male	01200000000	Egyptian	2026-02-01	\N	f	uploads\\medical_report-1771667835181-614856364.png	13	0	active	2026-02-21 09:57:16.285549	2026-02-21 11:18:28.454395	\N	\N	\N	\N
85	123	RRRRR	ررررر	RRRRR	ررررر	00012243445599	male	01112713532	Egyptian	2025-10-13	\N	f	uploads\\medical_report-1771499846904-727785246.jpg	1	0	active	2026-02-19 11:17:27.576737	2026-02-19 18:39:35.396195	\N	\N	\N	\N
87	125	RRRRR	ررررر	RRRRR	ررررر	07712243445599	male	01112713532	Egyptian	2025-10-13	\N	f	uploads\\medical_report-1771501304157-189008980.jpg	1	0	active	2026-02-19 11:41:44.936786	2026-02-19 18:39:54.332791	\N	\N	\N	\N
88	126	RRRRR	ررررر	RRRRR	ررررر	09712243445599	male	01112713532	Egyptian	2025-10-13	\N	f	uploads\\medical_report-1771501964172-178443867.jpg	1	0	active	2026-02-19 11:52:44.94279	2026-02-19 19:21:36.170024	\N	\N	\N	\N
94	137	emppp	emp1	emppp	emp1	02214563987456	female	01022345678	Egyptian	2000-05-05	\N	f	uploads\\medical_report-1771612235118-252571240.png	1	0	active	2026-02-20 18:30:34.3579	2026-02-20 19:49:19.14319	uploads\\national_id_front-1771612234955-762677962.png	uploads\\national_id_back-1771612234956-987525926.png	wadi houf	\N
90	133	Testing111	هنتست	Testinggg22	هنتستستستس	12093812037173	male	01011348979	Egyptian	2026-02-12	\N	f	uploads\\medical_report-1771599620009-407624974.png	1	0	active	2026-02-20 15:00:20.784578	2026-02-20 15:01:04.614442	uploads\\national_id_front-1771599619979-657403677.png	uploads\\national_id_back-1771599619996-367427238.png	Cairororororo	\N
91	134	ada	Test1111	awd	te	44444444444444	male	01011379817	Egyptian	2026-02-16	\N	f	uploads\\medical_report-1771599737841-412004645.png	1	0	pending	2026-02-20 15:02:18.790194	2026-02-20 15:02:19.322884	uploads\\national_id_front-1771599737755-367936287.png	uploads\\national_id_back-1771599737815-319465690.png	Cairo	\N
103	169	Amr	عمرو	Diab	دياب	99663388532277	male	01022345678	Egyptian	1996-02-22	\N	f	uploads\\medical_report-1771697051443-936187514.png	4	0	pending	2026-02-21 18:04:09.154125	2026-02-21 18:04:10.915992	uploads\\national_id_front-1771697051382-429657916.png	uploads\\national_id_back-1771697051422-562778015.png	wadi houf	\N
89	127	zed	سيسيسي	Zed	شسسشسش	12332145698700	male	011111122222	Egyptian	2025-02-01	\N	f	uploads\\medical_report-1771502900092-96179049.jpg	1	0	active	2026-02-19 12:08:20.337907	2026-02-20 23:18:16.819361	\N	\N	\N	\N
95	138	Kora	لاعب كوره	player	كوره	11111111111313	male	01001321122	Egyptian	2026-02-02	\N	f	uploads\\medical_report-1771622952056-982861720.png	1	0	active	2026-02-20 21:29:11.551797	2026-02-21 01:13:27.02848	\N	\N	\N	\N
93	136	Yara	Yara	Ahmed	Ahmed	99663388552277	female	01022345678	Egyptian	2000-02-22	\N	f	uploads\\medical_report-1771611195403-417539942.png	1	0	active	2026-02-20 18:13:13.901656	2026-02-21 01:34:21.43333	\N	\N	\N	\N
96	148	Ahmed	احمد	Mohammed	محمد	78965432100000	male	01200000000	Egyptian	2026-02-01	\N	f	uploads\\medical_report-1771667493395-884642229.png	1	0	pending	2026-02-21 09:51:34.520616	2026-02-21 09:51:35.401589	\N	\N	\N	\N
102	168	Moaataz	معتز	Wael	وائل	44771122558833	male	01022345678	Egyptian	1988-08-08	\N	f	uploads\\medical_report-1771688411078-756801792.png	1	0	pending	2026-02-21 15:40:10.666852	2026-02-21 15:40:11.507499	uploads\\national_id_front-1771688411021-385064153.png	uploads\\national_id_back-1771688411023-889619646.png	wadi houf	\N
104	170	neww	نيو	emp	عامل	99663386352244	male	01022345678	Egyptian	2000-07-07	\N	f	uploads\\medical_report-1771697579428-770569526.png	1	0	pending	2026-02-21 18:12:57.685821	2026-02-21 18:12:58.993178	uploads\\national_id_front-1771697579273-103741310.png	uploads\\national_id_back-1771697579378-600393575.png	wadi houf	\N
106	172	Yara	Yara	Ahmed	Ahmed	99663388552209	female	01022345678	Egyptian	2000-11-11	\N	f	uploads\\medical_report-1771698218706-504344655.png	1	0	pending	2026-02-21 18:23:36.922938	2026-02-21 18:23:38.214416	uploads\\national_id_front-1771698218619-287577771.png	uploads\\national_id_back-1771698218621-268761080.png	wadi houf	\N
108	174	Yara	Yara	Ahmed	Ahmed	44661133997717	female	01022345678	Egyptian	2004-07-04	\N	f	\N	4	0	pending	2026-02-21 18:36:15.008918	2026-02-21 18:36:16.144281	uploads\\national_id_front-1771698976568-413488091.png	\N	wadi houf	\N
109	175	youyaa	Yara	Ahmed	Ahmed	99663388552240	female	01022345678	Egyptian	2022-02-22	\N	f	\N	4	0	pending	2026-02-21 18:45:08.212674	2026-02-21 18:45:09.223954	\N	\N	wadi houf	\N
110	176	yuyuu	يارا	Ahmed	احمد	99663388512333	female	01022345678	Egyptian	2000-11-11	\N	f	\N	4	0	pending	2026-02-21 18:54:28.197894	2026-02-21 18:54:29.283528	\N	\N	wadi houf	\N
111	177	Yara	يارا	Ahmed	Ahmed	88225544669977	female	01022345678	Egyptian	1988-11-11	\N	f	uploads\\medical_report-1771701942362-866499124.png	2	0	pending	2026-02-21 19:25:39.633859	2026-02-21 19:25:41.93162	uploads\\national_id_front-1771701941477-21212387.png	uploads\\national_id_back-1771701941739-903730314.png	wadi houf	\N
112	178	Mohamed	محمد	Salem	سالم	30404042106096	male	01154880916	Egyptian	2004-04-01	\N	f	uploads\\medical_report-1771702648938-610955006.png	1	0	pending	2026-02-21 19:35:28.339732	2026-02-21 19:35:28.943464	uploads\\national_id_front-1771702648916-817213686.png	uploads\\national_id_back-1771702648929-843447238.png	Omranya, Giza, Egypt	\N
113	179	student	طالب	student	علم	22664477889915	male	01022345678	Egyptian	2000-02-20	\N	f	uploads\\medical_report-1771703596140-723738248.png	13	0	pending	2026-02-21 19:53:14.305091	2026-02-21 19:53:15.716819	uploads\\national_id_front-1771703595860-766814491.png	uploads\\national_id_back-1771703596075-83522291.png	wadi houf	\N
114	180	memoo	ميمو	mm	مم	78547854785478	male	01022345678	Egyptian	2000-12-22	\N	f	uploads\\medical_report-1771703809395-496513773.png	4	0	pending	2026-02-21 19:56:47.778695	2026-02-21 19:56:48.993819	uploads\\national_id_front-1771703809286-885424496.png	uploads\\national_id_back-1771703809287-900611802.png	wadi houf	\N
115	181	Yara	Yara	Ahmed	Ahmed	97897897897897	male	01022345678	Egyptian	2000-03-06	\N	f	uploads\\medical_report-1771704149108-571711141.png	3	0	pending	2026-02-21 20:02:26.634507	2026-02-21 20:02:30.814247	uploads\\national_id_front-1771704148629-166685615.png	uploads\\national_id_back-1771704148892-132111204.png	\N	\N
116	182	Fayrouz	فيروز	el gaza2reya	الجزائرية	12312345645641526363	female	01022345678	Foreigner	1950-02-22	\N	t	\N	12	0	pending	2026-02-21 20:10:53.494865	2026-02-21 20:10:53.494865	\N	\N	\N	\N
117	183	Emma	ايما	Watson	واطسون	75395164824862486248	female	01022345678	Foreigner	1999-11-11	\N	t	\N	12	0	pending	2026-02-21 20:13:00.688602	2026-02-21 20:13:00.688602	\N	\N	\N	\N
118	184	Emma	ايما	Stone	استون	75395164824862486241	female	01022345678	Foreigner	1999-11-11	\N	t	uploads\\medical_report-1771705280902-984431124.png	12	0	pending	2026-02-21 20:21:19.524921	2026-02-21 20:21:20.723718	uploads\\passport_photo-1771705280898-933344938.png	\N	wadi houf	\N
119	185	Judy	جودي	Ahmed	احمد	30303030303030	female	01022345678	Egyptian	2000-11-11	\N	f	uploads\\medical_report-1771705420729-287160379.png	4	0	pending	2026-02-21 20:23:39.117345	2026-02-21 20:23:40.344377	uploads\\national_id_front-1771705420462-476254399.png	uploads\\national_id_back-1771705420500-911026046.png	wadi houf	\N
120	186	Yara	Yara	Ahmed	Ahmed	99663388552205	female	01022345678	Egyptian	2000-02-22	\N	f	uploads\\medical_report-1771705912164-28637360.png	4	0	pending	2026-02-21 20:31:50.620175	2026-02-21 20:31:51.794053	uploads\\national_id_front-1771705912081-729699918.png	uploads\\national_id_back-1771705912081-220693736.png	wadi houf	\N
121	187	Younis	يونس	Ahmed	احمد	99663388552999	male	01022345678	Egyptian	2000-11-11	\N	f	uploads\\medical_report-1771706182938-586782281.png	4	0	pending	2026-02-21 20:36:21.333427	2026-02-21 20:36:22.556594	uploads\\national_id_front-1771706182870-835983286.png	uploads\\national_id_back-1771706182937-782236304.png	wadi houf	\N
122	188	new	new	emp	emp	12312300123001	male	01022345678	Egyptian	2000-11-11	\N	f	uploads\\medical_report-1771706543811-385156882.png	4	0	pending	2026-02-21 20:42:22.291982	2026-02-21 20:42:23.476142	uploads\\national_id_front-1771706543762-510647006.png	uploads\\national_id_back-1771706543773-348267416.png	wadi houf	\N
123	189	Yara	Yara	Ahmed	Ahmed	96363939636963	male	01022345678	Egyptian	1999-11-11	\N	f	uploads\\medical_report-1771707151576-423893231.png	2	0	pending	2026-02-21 20:52:29.932461	2026-02-21 20:52:31.280095	uploads\\national_id_front-1771707151455-477263247.png	uploads\\national_id_back-1771707151455-318551945.png	wadi houf	\N
124	190	Kerolos	Kerolos	Maged	Maged	11111111111111	male	01212121212	Egyptian	2020-01-28	\N	f	uploads\\medical_report-1771707353991-312522005.jpg	1	0	pending	2026-02-21 20:56:01.406709	2026-02-21 20:56:02.024014	uploads\\national_id_front-1771707353896-709026303.jpg	uploads\\national_id_back-1771707353980-231864744.jpg	helwan	\N
125	191	Yara	عضو	Ahmed	زائر	85479647852310	male	01022345678	Egyptian	2000-11-22	\N	f	uploads\\medical_report-1771707376719-386197962.png	2	0	pending	2026-02-21 20:56:15.269212	2026-02-21 20:56:16.30583	uploads\\national_id_front-1771707376668-797232315.png	uploads\\national_id_back-1771707376679-999208903.png	wadi houf	\N
140	207	Kerolos	عضو تابع	Maged	Maged	45645655555533	male	01235555555	Egyptian	2019-12-30	\N	f	\N	3	0	pending	2026-02-21 22:53:20.54367	2026-02-21 22:53:20.54367	\N	\N	\N	\N
129	195	Yara	Yara	Ahmed	Ahmed	99663388550000	female	01022345678	Egyptian	2000-11-11	\N	f	uploads\\medical_report-1771708358756-953865139.png	2	0	pending	2026-02-21 21:12:36.800046	2026-02-21 21:12:38.40517	uploads\\national_id_front-1771708358524-428902423.png	uploads\\national_id_back-1771708358734-133547568.png	wadi houf	\N
127	193	كيرلس	Kerolos	ماجد	Maged	01111111111111	male	01111111111	Egyptian	2018-12-31	\N	f	\N	1	0	active	2026-02-21 21:04:00.274782	2026-02-21 21:12:07.819158	\N	\N	helwan	\N
126	192	Yara	عضو	Ahmed	زائر2	99663388552770	male	01022345678	Egyptian	2005-05-05	\N	f	uploads\\medical_report-1771707637561-874111573.png	2	0	active	2026-02-21 21:00:36.01239	2026-02-21 21:12:23.378922	uploads\\national_id_front-1771707637521-789813134.png	uploads\\national_id_back-1771707637522-264735790.png	wadi houf	\N
128	194	كيرلس	Kerolos	ماجد	Maged	01111111111110	male	01111111111	Egyptian	2018-12-31	\N	f	uploads\\medical_report-1771707879809-113298149.jpg	1	0	active	2026-02-21 21:04:47.246236	2026-02-21 21:13:12.815689	uploads\\national_id_front-1771707879714-398664242.jpg	uploads\\national_id_back-1771707879782-789679470.jpg	helwan	\N
130	196	Kerolos	كيرلس	Maged	Maged	22222222222222	male	01222222222	Egyptian	2022-01-31	\N	f	uploads\\medical_report-1771708579796-700581897.jpg	1	0	active	2026-02-21 21:16:27.291379	2026-02-21 21:21:07.394506	uploads\\national_id_front-1771708579734-853090659.jpg	uploads\\national_id_back-1771708579752-494505556.jpg	helwan	\N
131	197	Yara	Yara	Ahmed	Ahmed	99663388551000	male	01022345678	Egyptian	2000-11-14	\N	f	uploads\\medical_report-1771709478268-682297457.png	2	0	pending	2026-02-21 21:31:16.623971	2026-02-21 21:31:17.911211	uploads\\national_id_front-1771709478176-527598384.png	uploads\\national_id_back-1771709478207-806319998.png	wadi houf	\N
137	204	Kerolos	طالب	Maged	Maged	78978954655523	male	01235555555	Egyptian	2026-02-12	\N	f	uploads\\medical_report-1771713822356-455850260.jpg	13	0	active	2026-02-21 22:43:49.253569	2026-02-21 22:44:49.131824	uploads\\national_id_front-1771713822314-857444618.jpg	uploads\\national_id_back-1771713822347-473881482.jpg	helwan	\N
132	198	Kerolos	Kero	Maged	Maged	33333333333333	male	01233333333	Egyptian	2021-06-15	\N	f	uploads\\medical_report-1771709578156-914587047.jpg	1	0	active	2026-02-21 21:33:05.702925	2026-02-21 21:34:52.98827	uploads\\national_id_front-1771709578108-484269085.jpg	uploads\\national_id_back-1771709578137-660226424.jpg	helwan	\N
133	199	Yara	Yaraahh	Ahmed	Ahmed	55552222000999	female	01025538754	Egyptian	1999-11-11	\N	f	uploads\\medical_report-1771709928248-197055947.png	2	0	pending	2026-02-21 21:38:46.746038	2026-02-21 21:38:47.91705	uploads\\national_id_front-1771709928181-516573577.png	uploads\\national_id_back-1771709928223-681168824.png	wadi houf	\N
143	210	Kerolos	عضو	Maged	تابع	78913222222220	male	01233333333	Egyptian	2016-07-14	\N	f	\N	3	0	suspended	2026-02-21 23:21:51.84257	2026-02-21 23:32:56.134242	\N	\N	\N	\N
134	200	عامل	عااامل	Maged	Maged	44444444444442	male	01236666666	Egyptian	2020-02-04	\N	f	uploads\\medical_report-1771710122783-394799505.jpg	1	0	active	2026-02-21 21:42:10.330572	2026-02-21 22:12:18.32338	uploads\\national_id_front-1771710122715-380486589.jpg	uploads\\national_id_back-1771710122758-763599194.jpg	helwan	\N
135	202	Kerolos	متقاعد	Maged	Maged	78978988888888	male	01234566666	Egyptian	2014-07-17	\N	f	\N	2	0	pending	2026-02-21 22:40:23.938312	2026-02-21 22:40:23.938312	\N	\N	\N	\N
97	149	Ahmed	احمد	Mohammed	محمد	79965432100000	male	01200000000	Egyptian	2026-02-01	\N	f	uploads\\medical_report-1771667684377-171871626.png	2	0	pending	2026-02-21 09:54:45.518136	2026-02-21 09:54:46.38814	\N	\N	\N	\N
141	208	Kerolos	عضو تابع	Maged	Maged	45645655555536	male	01235555555	Egyptian	2019-12-30	\N	f	\N	3	0	cancelled	2026-02-21 22:54:13.751705	2026-02-21 23:37:18.869275	\N	\N	\N	\N
144	211	Kerolos	اجنبى	Maged	zeyad	12354657988888888888	male	01234565555	Foreigner	2009-06-09	\N	t	uploads\\medical_report-1771716958097-804949194.jpg	12	0	active	2026-02-21 23:36:05.146503	2026-02-21 23:39:18.76803	uploads\\passport_photo-1771716958076-653233800.jpg	\N	helwan	\N
146	217	mohammed	محمد	heshams staff	هشامممممم	12314444444444	male	01013213216	Egyptian	2026-02-11	\N	f	uploads\\medical_report-1771733218294-282355816.png	2	0	active	2026-02-22 04:06:58.250897	2026-02-23 03:37:11.295317	uploads\\national_id_front-1771733218266-416378344.png	uploads\\national_id_back-1771733218275-228942606.png	Staff	\N
145	212	Kerolos	vistor	Maged	1	78985452322222	male	01235555555	Egyptian	2020-01-28	\N	f	uploads\\medical_report-1771717338521-389309813.jpg	4	0	suspended	2026-02-21 23:42:25.614385	2026-02-22 00:25:54.97769	uploads\\national_id_front-1771717338504-519145766.jpg	uploads\\national_id_back-1771717338513-555821190.jpg	helwan	\N
148	231	stduent	انا طالب	studnenene	طاللل	12412313131212	male	01011379817	Egyptian	2026-02-12	\N	f	uploads\\medical_report-1771894218365-633979150.png	2	0	pending	2026-02-24 00:50:18.81992	2026-02-24 00:50:19.43465	uploads\\national_id_front-1771894218365-870425514.png	uploads\\national_id_back-1771894218365-692445539.png	mmpamdasd	\N
147	220	Staff memeber	عضو ستاف	staff memeber	عضو ستاف	14124123124124	male	01023156164	Egyptian	2025-12-23	\N	f	uploads\\medical_report-1771791053526-257153180.png	2	0	active	2026-02-22 20:10:52.584841	2026-02-22 20:10:56.21887	uploads\\national_id_front-1771791053525-393554262.png	uploads\\national_id_back-1771791053525-237701088.png	asd	\N
151	234	Zeyad	Zeyad	Alaa Eldin Gad	Alaa Eldin Gad	00112233445177	male	01151031404	Egyptian	2000-11-11	\N	f	uploads\\medical_report-1771936433967-331242987.jpg	2	0	active	2026-02-24 12:33:54.549611	2026-02-24 12:35:17.432952	uploads\\national_id_front-1771936433966-714179682.jpg	uploads\\national_id_back-1771936433966-438956420.jpg	El-Shareef, Hadayek Helwan, El Masara, Cairo Governorate	\N
149	232	testingnignign	تيستتججج	sjeoiawjeiawe	تستستستd	45678456784567	male		Egyptian	\N	\N	f	uploads\\medical_report-1771894393287-747446874.png	2	0	active	2026-02-24 00:53:13.761556	2026-02-24 03:18:42.218169	uploads\\national_id_front-1771894393286-507979176.png	uploads\\national_id_back-1771894393287-411362040.png		\N
150	233	Zeyad	Zeyad	Alaa Eldin Gad	Alaa Eldin Gad	00112233445126	male	01151031404	Egyptian	2000-11-11	\N	f	\N	2	0	pending	2026-02-24 12:32:55.806135	2026-02-24 12:32:55.806135	\N	\N	\N	\N
153	236	zeyad	kiro	alaa	علاء	99232423235898	male		Egyptian	\N	\N	f	uploads\\medical_report-1771940823517-196578918.jpg	2	0	active	2026-02-24 13:47:03.772725	2026-02-24 13:48:15.70303	uploads\\national_id_front-1771940823500-673358333.jpg	uploads\\national_id_back-1771940823509-897735553.jpg		\N
71	103	Yara	يارا	Ahmed	أحمد	96396396396385	male		Foreigner	\N	\N	t	uploads\\medical_report-1771370646115-175203907.png	1	0	active	2026-02-17 23:24:06.366852	2026-02-24 19:20:27.604986	\N	\N		\N
152	235	kerolos	كيرلس	maged	ماجد	12324232358598	male	01233333333	Egyptian	2004-07-23	\N	f	\N	13	0	active	2026-02-24 13:21:40.059352	2026-02-24 13:42:52.817563	\N	\N	\N	\N
136	203	Kerolos	متقاعد	Maged	 ماجد	78978988888880	male	01211111111	Egyptian	2009-02-11	\N	f	uploads\\medical_report-1771713679194-934009517.jpg	2	0	active	2026-02-21 22:41:26.123234	2026-02-24 17:15:08.057774	uploads\\national_id_front-1771713679172-201937666.jpg	uploads\\national_id_back-1771713679188-950057913.jpg		\N
155	239	Zeyad	ئء	Alaa Eldin Gad	ئء	90112233445177	male	01151031404	Egyptian	2000-11-11	\N	f	uploads\\medical_report-1771944408075-888049678.jpg	13	0	active	2026-02-24 14:46:48.470791	2026-02-24 14:47:24.62002	uploads\\national_id_front-1771944408074-808604880.jpg	uploads\\national_id_back-1771944408074-1460389.jpg	El-Shareef, Hadayek Helwan, El Masara, Cairo Governorate	\N
154	238	Mahmoud	محمود	Durrah	الدرة	30404042106097	male		Egyptian	\N	\N	f	uploads\\medical_report-1771944433977-667872183.png	2	0	active	2026-02-24 14:45:11.841433	2026-02-24 17:21:31.633165	uploads\\national_id_front-1771944433874-747796430.png	uploads\\national_id_back-1771944433923-100899088.png		\N
156	241	taleb	طالب	taleb	طالب	30404042106091	female	01154880923	Egyptian	2005-02-14	\N	f	uploads\\medical_report-1771958649118-579359300.jpg	13	0	active	2026-02-24 18:42:06.397335	2026-02-24 18:43:12.591673	uploads\\national_id_front-1771958649088-776284426.jpg	uploads\\national_id_back-1771958649105-261469060.jpg	مصر	\N
157	242	Mohamed	حسام	Hossam	محمد	33333333333333333333	male	01154880915	Foreigner	2004-04-04	\N	t	uploads\\medical_report-1771961171729-116150213.jpg	12	0	active	2026-02-24 19:24:09.098495	2026-03-01 02:52:21.810333	uploads\\passport_photo-1771961171706-96886584.jpg	\N	Spain	\N
158	244	cc	ؤؤ	cc	ؤؤ	98997896554433	male	01200000000	Egyptian	2000-02-02	\N	f	uploads\\medical_report-1771975081473-616331086.jpeg	2	0	active	2026-02-24 23:18:02.433392	2026-02-24 23:18:04.037961	uploads\\national_id_front-1771975081467-34464718.jpeg	uploads\\national_id_back-1771975081470-488120986.jpeg	asdfghjkiuytre	\N
159	245	Testingggg	بنستيت الصور	photosss	صور تيستنج	10927398172398	male	01031283781	Egyptian	2006-01-14	\N	f	https://res.cloudinary.com/dkjnugbsd/image/upload/v1771986541/helwan-club/members/medical-reports/helwan-club/members/medical-reports/222-1771986541306.png	2	0	active	2026-02-25 02:28:55.989496	2026-02-25 04:45:11.336229	https://res.cloudinary.com/dkjnugbsd/image/upload/v1771986538/helwan-club/members/national-ids/helwan-club/members/national-ids/222-1771986537474.png	https://res.cloudinary.com/dkjnugbsd/image/upload/v1771986539/helwan-club/members/national-ids/helwan-club/members/national-ids/222-1771986539180.png	Cairooo	\N
160	247	MOmom	يشسي	MOpmwapd	يشصينخ	19127398127389	male	01013981273	Egyptian	1997-02-01	\N	f	https://res.cloudinary.com/dkjnugbsd/image/upload/v1771993681/helwan-club/members/medical-reports/helwan-club/members/medical-reports/222-1771993681045.png	2	0	active	2026-02-25 04:27:56.068922	2026-02-25 04:28:04.746485	https://res.cloudinary.com/dkjnugbsd/image/upload/v1771993678/helwan-club/members/national-ids/helwan-club/members/national-ids/222-1771993676853.png	https://res.cloudinary.com/dkjnugbsd/image/upload/v1771993678/helwan-club/members/national-ids/helwan-club/members/national-ids/222-1771993678652.png	daddawd	\N
162	249	Ford	فورد	Raptor	رابتور	30404042106084	male	01154880923	Egyptian	2004-04-04	\N	f	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772334381/helwan-club/members/medical-reports/helwan-club/members/medical-reports/Gemini_Generated_Image_mvq49kmvq49kmvq4-1772334484122.jpg	13	0	active	2026-03-01 03:04:58.029378	2026-03-01 03:07:47.579318	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772334321/helwan-club/members/national-ids/helwan-club/members/national-ids/Gemini_Generated_Image_mvq49kmvq49kmvq4-1772334422743.jpg	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772334343/helwan-club/members/national-ids/helwan-club/members/national-ids/Gemini_Generated_Image_mvq49kmvq49kmvq4-1772334445844.jpg	CA, USA	\N
161	248	Omar	عمر	Marmosh	مرموش	30404042106080	male	01154880915	Egyptian	2004-04-04	\N	f	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772334097/helwan-club/members/medical-reports/helwan-club/members/medical-reports/Gemini_Generated_Image_mvq49kmvq49kmvq4-1772334197074.jpg	13	0	active	2026-03-01 03:00:06.324672	2026-03-01 03:07:59.963372	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772334031/helwan-club/members/national-ids/helwan-club/members/national-ids/Gemini_Generated_Image_mvq49kmvq49kmvq4-1772334131047.jpg	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772334054/helwan-club/members/national-ids/helwan-club/members/national-ids/Gemini_Generated_Image_mvq49kmvq49kmvq4-1772334157200.jpg	شارع السلام, العمرانية, الجيزة. مصر	\N
166	255	ii	هه	ii	هه	53268912578523	male	01151031404	Egyptian	2005-02-02	\N	f	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772394651/helwan-club/members/medical-reports/helwan-club/members/medical-reports/61c93afd41ffcc9b6ece0f07d4248036-1772394649948.jpg	13	0	pending	2026-03-01 19:50:42.887741	2026-03-01 19:50:53.662448	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772394646/helwan-club/members/national-ids/helwan-club/members/national-ids/61c93afd41ffcc9b6ece0f07d4248036-1772394643490.jpg	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772394647/helwan-club/members/national-ids/helwan-club/members/national-ids/61c93afd41ffcc9b6ece0f07d4248036-1772394646279.jpg	21 Elshrif Street,hadayek helwan	\N
163	250	Omar	عمر	Ehab	ايهاببب	30404042106099	male		Egyptian	\N	\N	f	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772366403/helwan-club/members/medical-reports/helwan-club/members/medical-reports/WhatsApp%20Image%202026-03-01%20at%201.55.55%20PM-1772366527956.jpg	13	0	active	2026-03-01 11:59:58.20194	2026-03-01 17:38:48.631583	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772366399/helwan-club/members/national-ids/helwan-club/members/national-ids/WhatsApp%20Image%202026-03-01%20at%201.55.55%20PM-1772366523177.jpg	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772366401/helwan-club/members/national-ids/helwan-club/members/national-ids/WhatsApp%20Image%202026-03-01%20at%201.55.55%20PM-1772366525176.jpg		\N
164	251	Mahmoud	محمود	Khaled	خالد	30502172104894	male	01018159239	Egyptian	2005-02-17	\N	f	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772388268/helwan-club/members/medical-reports/helwan-club/members/medical-reports/Gemini_Generated_Image_mvq49kmvq49kmvq4-1772388385228.jpg	13	0	active	2026-03-01 18:03:55.006475	2026-03-01 18:06:04.14947	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772388245/helwan-club/members/national-ids/helwan-club/members/national-ids/Gemini_Generated_Image_mvq49kmvq49kmvq4-1772388360677.jpg	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772388255/helwan-club/members/national-ids/helwan-club/members/national-ids/Gemini_Generated_Image_mvq49kmvq49kmvq4-1772388370664.jpg	نصر الدين ,الهرم ,الجيزة	\N
165	252	Abdo	عبدو	Just	جاست	30404042106076	male	01154889275	Egyptian	2004-11-11	\N	f	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772390593/helwan-club/members/medical-reports/helwan-club/members/medical-reports/Gemini_Generated_Image_mvq49kmvq49kmvq4-1772390711845.jpg	13	0	pending	2026-03-01 18:42:50.565518	2026-03-01 18:43:23.0142	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772390576/helwan-club/members/national-ids/helwan-club/members/national-ids/Gemini_Generated_Image_mvq49kmvq49kmvq4-1772390695844.jpg	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772390580/helwan-club/members/national-ids/helwan-club/members/national-ids/Gemini_Generated_Image_mvq49kmvq49kmvq4-1772390701757.jpg	4ش فوزى ع ش 	\N
\.


--
-- Data for Name: membership_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.membership_plans (id, member_type_id, plan_code, name_en, name_ar, description_en, price, currency, duration_months, renewal_price, is_installable, max_installments, is_active, is_for_foreigner, min_age, max_age, created_at, updated_at, description_ar) FROM stdin;
1	2	WORK_PROFESSOR	Faculty Member	أستاذ / أساتذة قارة	Fixed price for faculty members	20000.00	EGP	12	300.00	t	10	t	f	\N	\N	2026-01-24 15:50:34.451083	2026-01-24 15:50:34.451083	\N
3	2	WORK_8K	Staff - 8K EGP	موظف - 8,000 جنيه	For salary 8,000-10,000 EGP	8000.00	EGP	12	300.00	t	10	t	f	\N	\N	2026-01-24 15:50:34.451083	2026-01-24 15:50:34.451083	\N
4	2	WORK_5K	Staff - 5K EGP	موظف - 5,000 جنيه	For salary 5,000-8,000 EGP	5000.00	EGP	12	300.00	t	10	t	f	\N	\N	2026-01-24 15:50:34.451083	2026-01-24 15:50:34.451083	\N
5	2	WORK_LOW	Staff - Below 5K	موظف - أقل من 5,000 جنيه	For salary below 5,000 EGP	2000.00	EGP	12	300.00	t	10	t	f	\N	\N	2026-01-24 15:50:34.451083	2026-01-24 15:50:34.451083	\N
7	2	RETIRED_10K	Retired Staff - 10K	موظف متقاعد - 10,000 جنيه	For retired staff with high pension	10000.00	EGP	12	300.00	f	\N	t	f	\N	\N	2026-01-24 15:50:34.451083	2026-01-24 15:50:34.451083	\N
8	2	RETIRED_8K	Retired Staff - 8K	موظف متقاعد - 8,000 جنيه	For retired staff with medium pension	8000.00	EGP	12	300.00	f	\N	t	f	\N	\N	2026-01-24 15:50:34.451083	2026-01-24 15:50:34.451083	\N
9	2	RETIRED_5K	Retired Staff - 5K	موظف متقاعد - 5,000 جنيه	For retired staff with lower pension	5000.00	EGP	12	300.00	f	\N	t	f	\N	\N	2026-01-24 15:50:34.451083	2026-01-24 15:50:34.451083	\N
10	2	RETIRED_LOW	Retired Staff - Low	موظف متقاعد - أقل من 5,000	For retired staff with low pension	2000.00	EGP	12	300.00	f	\N	t	f	\N	\N	2026-01-24 15:50:34.451083	2026-01-24 15:50:34.451083	\N
12	3	DEP_SECOND	Second Dependent	التابع الثاني	Second dependent family member (40% discount applied)	1500.00	EGP	12	1000.00	f	\N	t	f	\N	\N	2026-01-24 15:50:34.451083	2026-01-24 15:50:34.451083	\N
14	4	VISITOR	Visitor Member	العضو الزائر	Annual visitor membership	5000.00	EGP	12	3750.00	f	\N	t	f	\N	\N	2026-01-24 15:50:34.451083	2026-01-24 15:50:34.451083	\N
15	13	STUDENT_PLAN	Student Member	عضو الطالب	University student membership	3000.00	EGP	12	3000.00	f	\N	t	f	\N	\N	2026-01-24 15:50:34.451083	2026-01-24 15:50:34.451083	\N
141	15	FULL_ACCESS	Full Access	عضوية كاملة	Full access plan	500.00	EGP	12	\N	f	\N	t	f	\N	\N	2026-02-21 09:54:39.454099	2026-02-21 09:54:39.454099	خطة بصلاحيات كاملة
16	1	FOUNDER	Founder Member	العضو المؤسس	Founding member - lifetime privileges	200.00	EGP	13	50.00	f	\N	t	f	\N	\N	2026-01-24 15:50:34.451083	2026-02-24 13:18:33.378709	\N
13	3	DEP_THIRD	Third+ Dependent	التابع الثالث وما بعده	Third and additional dependents (40% discount applied)	1000.00	EGP	12	1000.00	f	\N	t	f	\N	\N	2026-01-24 15:50:34.451083	2026-02-14 09:04:24.521858	\N
111	13	Zed	VIP Zed	VIP Zed	\N	10000.00	EGP	1	7500.00	f	\N	t	f	\N	\N	2026-02-16 19:44:18.919522	2026-02-16 19:44:18.919522	\N
113	2	ANNUAL	Standard Annual Membership	عضوية سنوية	Standard yearly membership plan	1000.00	EGP	12	300.00	t	4	t	f	\N	\N	2026-02-17 01:13:31.966724	2026-02-17 01:13:31.966724	\N
119	13	STUDENT	Student Membership	عضوية طلاب	Discounted membership for university students	200.00	EGP	12	\N	f	\N	t	f	\N	\N	2026-02-17 16:47:26.37556	2026-02-17 16:47:26.37556	عضوية مخفضة لطلاب الجامعة
120	3	DEPENDENT	Dependent Membership	عضوية تابعة	Membership for family members	300.00	EGP	12	\N	f	\N	t	f	\N	\N	2026-02-17 16:47:26.774531	2026-02-17 16:47:26.774531	عضوية لأفراد العائلة
121	9	SEASONAL	Seasonal Membership	عضوية موسمية	Short-term membership	400.00	EGP	3	\N	f	\N	t	f	\N	\N	2026-02-17 16:47:27.142187	2026-02-17 16:47:27.142187	عضوية قصيرة المدى
\.


--
-- Data for Name: outsider_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.outsider_details (id, member_id, job_title_en, job_title_ar, employment_status, created_at, updated_at, branch_id, visitor_type, passport_number, passport_photo, country, visa_status, duration_months, is_installable) FROM stdin;
1	69	\N	\N	employed	2026-02-17 21:07:51.222256	2026-02-17 21:07:51.222256	\N	VISITOR	\N	\N	\N	\N	\N	f
2	71	\N	\N	employed	2026-02-17 23:24:07.601191	2026-02-17 23:24:07.601191	\N	seasonal-foreigner	96396396396385	uploads\\passport_photo-1771370646089-647648861.png	Foreigner	valid	1	f
3	103	\N	\N	employed	2026-02-21 18:04:11.309286	2026-02-21 18:04:11.309286	\N	VISITOR	\N	\N	\N	\N	\N	f
4	118	\N	\N	employed	2026-02-21 20:21:20.960583	2026-02-21 20:21:20.960583	\N	seasonal-foreigner	75395164824862486241	uploads\\passport_photo-1771705280898-933344938.png	Foreigner	valid	1	f
5	119	\N	\N	employed	2026-02-21 20:23:40.639131	2026-02-21 20:23:40.639131	\N	VISITOR	\N	\N	\N	\N	\N	f
6	125	\N	\N	employed	2026-02-21 20:56:16.536764	2026-02-21 20:56:16.536764	\N	VISITOR	\N	\N	\N	\N	\N	f
7	126	\N	\N	employed	2026-02-21 21:00:37.430337	2026-02-21 21:00:37.430337	\N	VISITOR	\N	\N	\N	\N	\N	f
8	129	\N	\N	employed	2026-02-21 21:12:38.642374	2026-02-21 21:12:38.642374	\N	VISITOR	\N	\N	\N	\N	\N	f
9	131	\N	\N	employed	2026-02-21 21:31:18.163733	2026-02-21 21:31:18.163733	\N	VISITOR	\N	\N	\N	\N	\N	f
10	133	\N	\N	employed	2026-02-21 21:38:48.187661	2026-02-21 21:38:48.187661	\N	VISITOR	\N	\N	\N	\N	\N	f
11	144	\N	\N	employed	2026-02-21 23:36:06.214918	2026-02-21 23:36:06.214918	\N	seasonal-foreigner	12354657988888888888	uploads\\passport_photo-1771716958076-653233800.jpg	Foreigner	valid	6	f
12	145	\N	\N	employed	2026-02-21 23:42:26.63954	2026-02-21 23:42:26.63954	\N	VISITOR	\N	\N	\N	\N	\N	f
13	157	\N	\N	employed	2026-02-24 19:24:10.160734	2026-02-24 19:24:10.160734	\N	seasonal-foreigner	33333333333333333333	uploads\\passport_photo-1771961171706-96886584.jpg	Foreigner	valid	1	f
\.


--
-- Data for Name: packages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.packages (id, code, name_en, name_ar, description_en, description_ar, is_active, created_at, updated_at) FROM stdin;
3	EXEC_FULL	Executive Manager Full Access	وصول كامل للمدير التنفيذي	Complete system access	وصول كامل للنظام	t	2026-02-05 01:58:25.172721	2026-02-05 01:58:25.172721
4	DEPEXEC_FULL	DEPExecutive Manager Full Access	وصول كامل للنائب مدير التنفيذي	Complete system access	وصول كامل للنظام	t	2026-02-05 02:00:06.098115	2026-02-05 02:00:06.098115
5	ADMIN_FULL	Administrator Full Access	وصول كامل للمسئول	Complete system access including audit logs and admin account creation	وصول كامل للنظام بما في ذلك سجلات التدقيق وإنشاء الحسابات	t	2026-02-10 03:05:07.72842	2026-02-10 03:05:07.72842
6	MEDIA_CENTER_FULL	Media Center Full Access	وصول كامل للمركز الإعلامي	Full access to manage, publish, approve, edit and delete media center advertisements and categories	وصول كامل لإدارة ونشر واعتماد وتعديل وحذف إعلانات وتصنيفات المركز الإعلامي	t	2026-02-13 20:49:53.543331	2026-02-13 20:49:53.543331
1	MEDIA_FULL	Full Media Access	صلاحيات الإعلام كاملة	Allows all media operations	يسمح بجميع عمليات الإعلام	t	2026-02-16 07:53:32.823126	2026-02-16 07:53:32.823126
2	PKG_1771616802611	باقه المدير	باقه المدير	\N	\N	t	2026-02-20 19:46:45.59993	2026-02-20 19:46:45.59993
7	PKG_1771683880570	مدير الموارد البشرية و العضويات	مدير الموارد البشرية و العضويات	\N	\N	t	2026-02-21 14:24:41.618862	2026-02-21 14:24:41.618862
8	LJFIHIH	ljfihih	ljfihih	\N	\N	t	2026-02-22 00:28:39.194585	2026-02-22 00:28:39.194585
9	PKG_1771735341359	باقه مدير كبير جداً	باقه مدير كبير جداً	\N	\N	t	2026-02-22 04:42:23.197787	2026-02-22 04:42:23.197787
10	PKG_1771991755385	باقة عمو المدير	باقة عمو المدير	\N	\N	t	2026-02-25 03:55:56.613555	2026-02-25 03:55:56.613555
\.


--
-- Data for Name: privileges; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.privileges (id, code, name_en, name_ar, description_en, description_ar, module, is_active, created_at, updated_at) FROM stdin;
1	VIEW_PRIVILEGES	View Privileges	عرض الصلاحيات	Allows viewing all system privileges	يسمح بعرض جميع الصلاحيات في النظام	PRIVILEGE_MANAGEMENT	t	2026-02-09 22:32:12.44327	2026-02-09 22:32:12.44327
2	VIEW_PACKAGES	View Packages	عرض الباقات	Allows viewing all privilege packages	يسمح بعرض جميع باقات الصلاحيات	PACKAGE_MANAGEMENT	t	2026-02-09 22:32:12.44327	2026-02-09 22:32:12.44327
3	CREATE_PACKAGE	Create Package	إنشاء باقة	Allows creating new privilege packages	يسمح بإنشاء باقات صلاحيات جديدة	PACKAGE_MANAGEMENT	t	2026-02-09 22:32:12.44327	2026-02-09 22:32:12.44327
4	CHANGE_PACKAGE_STATUS	Change Package Status	تغيير حالة الباقة	Allows activating or deactivating privilege packages	يسمح بتفعيل أو تعطيل باقات الصلاحيات	PACKAGE_MANAGEMENT	t	2026-02-09 22:32:12.44327	2026-02-09 22:32:12.44327
5	EDIT_PACKAGE	Edit Package	تعديل باقة	Allows editing existing privilege packages	يسمح بتعديل باقات الصلاحيات	PACKAGE_MANAGEMENT	t	2026-02-09 22:32:12.44327	2026-02-09 22:32:12.44327
6	MANAGE_PACKAGE_PRIVILEGES	Add/Remove Privileges to Packages	إضافة/حذف صلاحيات من الباقات	Allows adding or removing privileges from packages	يسمح بإضافة أو حذف صلاحيات من الباقات	PACKAGE_MANAGEMENT	t	2026-02-09 22:32:12.44327	2026-02-09 22:32:12.44327
7	VIEW_AUDIT_LOGS	View Audit Logs	عرض سجلات العمليات	Allows viewing system audit logs	يسمح بعرض سجلات العمليات في النظام	ADMIN	t	2026-02-09 22:33:23.955675	2026-02-09 22:33:23.955675
8	CREATE_EXECUTIVE_DIRECTOR	Create Executive Director Account	إنشاء حساب المدير التنفيذي	Allows creating an Executive Director account	يسمح بإنشاء حساب مدير تنفيذي	ADMIN	t	2026-02-09 22:33:23.955675	2026-02-09 22:33:23.955675
10	VIEW_STAFF	View Staff	عرض الموظفين	View staff list and details	عرض قائمة الموظفين وتفاصيلهم	STAFF	t	2026-02-09 22:55:55.749969	2026-02-09 22:55:55.749969
11	CREATE_STAFF	Create Staff	إضافة موظف	Add new staff member	إضافة موظف جديد	STAFF	t	2026-02-09 22:55:55.749969	2026-02-09 22:55:55.749969
12	UPDATE_STAFF	Update Staff	تعديل موظف	Edit staff information	تعديل بيانات الموظف	STAFF	t	2026-02-09 22:55:55.749969	2026-02-09 22:55:55.749969
13	CHANGE_STAFF_STATUS	Change Staff Status	تغيير حالة الموظف	Change Staff account status	تغيير حالة حساب الموظف	STAFF	t	2026-02-09 22:55:55.749969	2026-02-09 22:55:55.749969
14	REVIEW_STAFF	Review Staff	مراجعة الموظف 	Review Staff information	مراجعة بيانات الموظف 	STAFF	t	2026-02-09 22:55:55.749969	2026-02-09 22:55:55.749969
15	ASSIGN_STAFF_TYPE	Assign Staff Type	تحديد نوع الوظيفة	Assign staff type to employee	تحديد نوع الوظيفة للموظف	STAFF	t	2026-02-09 22:55:55.749969	2026-02-09 22:55:55.749969
16	CHANGE_STAFF_TYPE	Change Staff Type	تغيير نوع الوظيفة	Change staff type	تغيير نوع الوظيفة للموظف	STAFF	t	2026-02-09 22:55:55.749969	2026-02-09 22:55:55.749969
17	RESET_STAFF_PASSWORD	Reset Staff Password	إعادة تعيين كلمة مرور الموظف	Reset staff password	إعادة تعيين كلمة مرور الموظف	STAFF	t	2026-02-09 22:55:55.749969	2026-02-09 22:55:55.749969
18	VIEW_STAFF_ATTENDANCE	View Staff Attendance	عرض حضور الموظفين	View staff attendance records	عرض سجلات حضور الموظفين	STAFF	t	2026-02-09 22:55:55.749969	2026-02-09 22:55:55.749969
19	EDIT_STAFF_ATTENDANCE	Edit Staff Attendance	تعديل حضور الموظفين	Edit staff attendance records	تعديل سجلات حضور الموظفين	STAFF	t	2026-02-09 22:55:55.749969	2026-02-09 22:55:55.749969
20	VIEW_STAFF_PERFORMANCE	View Staff Performance	عرض تقييم الموظفين	View staff performance reports	عرض تقارير تقييم الموظفين	STAFF	t	2026-02-09 22:55:55.749969	2026-02-09 22:55:55.749969
21	EVALUATE_STAFF	Evaluate Staff	تقييم الموظفين	Evaluate staff performance	تقييم أداء الموظفين	STAFF	t	2026-02-09 22:55:55.749969	2026-02-09 22:55:55.749969
22	TRANSFER_STAFF	Transfer Staff	نقل موظف	Transfer staff between departments	نقل الموظف بين الإدارات	STAFF	t	2026-02-09 22:55:55.749969	2026-02-09 22:55:55.749969
23	TERMINATE_STAFF	Terminate Staff	إنهاء خدمة موظف	Terminate staff contract	إنهاء خدمة الموظف	STAFF	t	2026-02-09 22:55:55.749969	2026-02-09 22:55:55.749969
24	VIEW_STAFF_PACKAGES	View Staff Packages	عرض باقات الموظف	Allows viewing which packages are assigned to a staff member	يسمح بعرض الباقات المخصصة لموظف معين	STAFF	t	2026-02-09 22:55:55.749969	2026-02-09 22:55:55.749969
25	ASSIGN_REVOKE_PACKAGE	Assign/Revoke Packages to Staff	إسناد/سحب باقات للموظفين	Allows assigning or revoking packages for staff members	يسمح بإسناد أو سحب باقات من الموظفين	STAFF	t	2026-02-09 22:55:55.749969	2026-02-09 22:55:55.749969
26	MANAGE_STAFF_PRIVILEGES	Add/Remove Privileges to Staff	إضافة/حذف صلاحيات من الموظف	Allows adding or removing privileges from staff	يسمح بإضافة أو حذف صلاحيات من الموظف	STAFF	t	2026-02-09 22:55:55.749969	2026-02-09 22:55:55.749969
27	MANAGE_STAFF_REQUESTS	Manage Staff Requests	إدارة طلبات الموظف	Manage staff requests	إدارة طلبات الموظف	STAFF	t	2026-02-09 22:55:55.749969	2026-02-09 22:55:55.749969
28	PRINT_STAFF_CARD	Print Staff Card	طباعة كارنيه الموظف	Print staff card	طباعة كارنيه الموظف	STAFF	t	2026-02-09 22:55:55.749969	2026-02-09 22:55:55.749969
29	VIEW_STAFF_TYPES	View Staff Types	عرض أنواع الوظائف	View staff types	عرض أنواع الوظائف	STAFF_TYPES	t	2026-02-09 22:55:55.749969	2026-02-09 22:55:55.749969
30	CREATE_STAFF_TYPE	Create Staff Type	إضافة نوع وظيفة	Create new staff type	إضافة نوع وظيفة جديد	STAFF_TYPES	t	2026-02-09 22:55:55.749969	2026-02-09 22:55:55.749969
31	UPDATE_STAFF_TYPE	Update Staff Type	تعديل نوع وظيفة	Edit staff type	تعديل نوع الوظيفة	STAFF_TYPES	t	2026-02-09 22:55:55.749969	2026-02-09 22:55:55.749969
32	DELETE_STAFF_TYPE	Delete Staff Type	حذف نوع وظيفة	Delete staff type	حذف نوع الوظيفة	STAFF_TYPES	t	2026-02-09 22:55:55.749969	2026-02-09 22:55:55.749969
33	VIEW_MEMBERS	View Members	عرض الأعضاء	View members list and details	عرض قائمة الأعضاء وتفاصيلهم	MEMBERS	t	2026-02-09 23:01:17.134132	2026-02-09 23:01:17.134132
34	CREATE_MEMBER	Create Member	إضافة عضو	Add new member	إضافة عضو جديد	MEMBERS	t	2026-02-09 23:01:17.134132	2026-02-09 23:01:17.134132
35	UPDATE_MEMBER	Update Member	تعديل عضو	Edit member information	تعديل بيانات العضو	MEMBERS	t	2026-02-09 23:01:17.134132	2026-02-09 23:01:17.134132
36	REVIEW_MEMBER	Review Member	مراجعة عضو	Review member information	مراجعة بيانات العضو	MEMBERS	t	2026-02-09 23:01:17.134132	2026-02-09 23:01:17.134132
37	CHANGE_MEMBER_STATUS	Change Member Status	تغيير حالة العضو	Change member account status	تغيير حالة حساب العضو	MEMBERS	t	2026-02-09 23:01:17.134132	2026-02-09 23:01:17.134132
38	MANAGE_MEMBER_BLOCK	Manage Member Block	إدارة حظر العضو	Block or unblock member account	حظر أو إلغاء حظر حساب العضو	MEMBERS	t	2026-02-09 23:01:17.134132	2026-02-09 23:01:17.134132
39	RESET_MEMBER_PASSWORD	Reset Member Password	إعادة تعيين كلمة مرور العضو	Reset member password	إعادة تعيين كلمة مرور العضو	MEMBERS	t	2026-02-09 23:01:17.134132	2026-02-09 23:01:17.134132
40	VIEW_MEMBER_HISTORY	View Member History	عرض سجل العضو	View member activity history	عرض سجل نشاط العضو	MEMBERS	t	2026-02-09 23:01:17.134132	2026-02-09 23:01:17.134132
41	MANAGE_MEMBERSHIP_REQUEST	Manage Membership Request	 إدارة طلب عضوية	Manage membership request	إدارة طلب العضوية	MEMBERS	t	2026-02-09 23:01:17.134132	2026-02-09 23:01:17.134132
42	UPLOAD_MEMBER_DOCUMENT	Upload Member Document	رفع مستندات العضو	Upload member documents	رفع مستندات العضو	MEMBERS	t	2026-02-09 23:01:17.134132	2026-02-09 23:01:17.134132
43	DELETE_MEMBER_DOCUMENT	Delete Member Document	حذف مستندات العضو	Delete member documents	حذف مستندات العضو	MEMBERS	t	2026-02-09 23:01:17.134132	2026-02-09 23:01:17.134132
44	PRINT_MEMBER_DOCUMENT	Print Member Document	طباعة مستندات العضو	Print member documents	طباعة مستندات العضو	MEMBERS	t	2026-02-09 23:01:17.134132	2026-02-09 23:01:17.134132
45	PRINT_MEMBER_CARD	Print Member Card	طباعة كارنيه العضو	Print member card	طباعة كارنيه العضو	MEMBERS	t	2026-02-09 23:01:17.134132	2026-02-09 23:01:17.134132
46	VIEW_MEMBER_FORMS	View Member Forms	عرض استمارات العضو	View all forms submitted by members	عرض كل الاستمارات المقدمة من الأعضاء	MEMBER	t	2026-02-09 23:01:17.134132	2026-02-09 23:01:17.134132
47	SUBMIT_MEMBER_FORM	Submit Member Form	تقديم استمارة عضو	Submit a new form by member	تقديم استمارة جديدة من العضو	MEMBER	t	2026-02-09 23:01:17.134132	2026-02-09 23:01:17.134132
48	UPDATE_MEMBER_FORM	Update Member Form	تعديل استمارة عضو	Update member form	تعديل استمارة العضو	MEMBER	t	2026-02-09 23:01:17.134132	2026-02-09 23:01:17.134132
49	DELETE_MEMBER_FORM	Delete Member Form	حذف استمارة عضو	Delete member form	حذف استمارة العضو	MEMBER	t	2026-02-09 23:01:17.134132	2026-02-09 23:01:17.134132
50	VIEW_MEMBERSHIP_PLANS	View Membership Plans	عرض خطط العضوية	View membership plans	عرض خطط العضوية	MEMBERSHIP_PLANS	t	2026-02-09 23:01:59.513601	2026-02-09 23:01:59.513601
51	CREATE_MEMBERSHIP_PLAN	Create Membership Plan	إضافة خطة عضوية	Create membership plan	إضافة خطة عضوية	MEMBERSHIP_PLANS	t	2026-02-09 23:01:59.513601	2026-02-09 23:01:59.513601
52	UPDATE_MEMBERSHIP_PLAN	Update Membership Plan	تعديل خطة عضوية	Edit membership plan	تعديل خطة العضوية	MEMBERSHIP_PLANS	t	2026-02-09 23:01:59.513601	2026-02-09 23:01:59.513601
53	DELETE_MEMBERSHIP_PLAN	Delete Membership Plan	حذف خطة عضوية	Delete membership plan	حذف خطة العضوية	MEMBERSHIP_PLANS	t	2026-02-09 23:01:59.513601	2026-02-09 23:01:59.513601
54	CHANGE_MEMBERSHIP_PLAN_STATUS	Change Membership Plan Status	تغيير حالة العضوية	Change membership plan status	تغيير حالة العضوية	MEMBERSHIP_PLANS	t	2026-02-09 23:01:59.513601	2026-02-09 23:01:59.513601
55	ASSIGN_MEMBERSHIP_PLAN_TO_MEMBER	Assign Membership Plan to Member	تعيين خطة عضوية لعضو	Assign membership plan to member	تعيين خطة العضوية للعضو	MEMBERSHIP_PLANS	t	2026-02-09 23:01:59.513601	2026-02-09 23:01:59.513601
56	CHANGE_MEMBER_MEMBERSHIP_PLAN	Change Member Membership Plan	تغيير خطة عضوية عضو	Change member membership plan	تغيير خطة العضوية للعضو	MEMBERSHIP_PLANS	t	2026-02-09 23:01:59.513601	2026-02-09 23:01:59.513601
57	VIEW_MEMBER_TYPES	View Member Types	عرض أنواع العضوية	View member types	عرض أنواع العضوية	MEMBER_TYPES	t	2026-02-09 23:01:59.513601	2026-02-09 23:01:59.513601
58	CREATE_MEMBER_TYPE	Create Member Type	إضافة نوع عضوية	Create member type	إضافة نوع عضوية	MEMBER_TYPES	t	2026-02-09 23:01:59.513601	2026-02-09 23:01:59.513601
59	UPDATE_MEMBER_TYPE	Update Member Type	تعديل نوع عضوية	Edit member type	تعديل نوع العضوية	MEMBER_TYPES	t	2026-02-09 23:01:59.513601	2026-02-09 23:01:59.513601
60	DELETE_MEMBER_TYPE	Delete Member Type	حذف نوع عضوية	Delete member type	حذف نوع العضوية	MEMBER_TYPES	t	2026-02-09 23:01:59.513601	2026-02-09 23:01:59.513601
61	ASSIGN_MEMBER_TYPE_TO_MEMBER	Assign Member Type to Member	تعيين نوع عضوية لعضو	Assign member type to member	تعيين نوع العضوية للعضو	MEMBER_TYPES	t	2026-02-09 23:01:59.513601	2026-02-09 23:01:59.513601
62	VIEW_FACULTIES	View Faculties	عرض الكليات	View faculties	عرض الكليات	FACULTIES	t	2026-02-09 23:01:59.513601	2026-02-09 23:01:59.513601
63	CREATE_FACULTY	Create Faculty	إضافة كلية	Create faculty	إضافة كلية	FACULTIES	t	2026-02-09 23:01:59.513601	2026-02-09 23:01:59.513601
64	UPDATE_FACULTY	Update Faculty	تعديل كلية	Edit faculty	تعديل كلية	FACULTIES	t	2026-02-09 23:01:59.513601	2026-02-09 23:01:59.513601
65	DELETE_FACULTY	Delete Faculty	حذف كلية	Delete faculty	حذف كلية	FACULTIES	t	2026-02-09 23:01:59.513601	2026-02-09 23:01:59.513601
66	ASSIGN_FACULTY_TO_MEMBER	Assign Faculty to Member	تعيين كلية لعضو	Assign faculty to member	تعيين الكلية للعضو	FACULTIES	t	2026-02-09 23:01:59.513601	2026-02-09 23:01:59.513601
67	VIEW_PROFESSIONS	View Professions	عرض الوظائف	View professions	عرض الوظائف	PROFESSIONS	t	2026-02-09 23:01:59.513601	2026-02-09 23:01:59.513601
68	CREATE_PROFESSION	Create Profession	إضافة وظيفة	Create profession	إضافة وظيفة	PROFESSIONS	t	2026-02-09 23:01:59.513601	2026-02-09 23:01:59.513601
69	UPDATE_PROFESSION	Update Profession	تعديل وظيفة	Edit profession	تعديل الوظيفة	PROFESSIONS	t	2026-02-09 23:01:59.513601	2026-02-09 23:01:59.513601
70	DELETE_PROFESSION	Delete Profession	حذف وظيفة	Delete profession	حذف الوظيفة	PROFESSIONS	t	2026-02-09 23:01:59.513601	2026-02-09 23:01:59.513601
71	ASSIGN_PROFESSION_TO_MEMBER	Assign Profession to Member	تعيين وظيفة لعضو	Assign profession to member	تعيين الوظيفة للعضو	PROFESSIONS	t	2026-02-09 23:01:59.513601	2026-02-09 23:01:59.513601
72	VIEW_TEAM_MEMBERS	View Team Members	عرض أعضاء الفرق	View all team members	عرض كل أعضاء الفرق	TEAM_MEMBERS	t	2026-02-09 23:03:10.038474	2026-02-09 23:03:10.038474
73	ADD_TEAM_MEMBER	Add Team Member	إضافة عضو لفريق	Add new team member	إضافة عضو جديد للفريق	TEAM_MEMBERS	t	2026-02-09 23:03:10.038474	2026-02-09 23:03:10.038474
74	UPDATE_TEAM_MEMBER	Update Team Member	تعديل عضو فريق	Edit team member information	تعديل بيانات عضو الفريق	TEAM_MEMBERS	t	2026-02-09 23:03:10.038474	2026-02-09 23:03:10.038474
75	REVIEW_TEAM_MEMBER	Review Team Member	مراجعة عضو الفريق	Review Team member information	مراجعة بيانات عضو الفريق	TEAM_MEMBERS	t	2026-02-09 23:03:10.038474	2026-02-09 23:03:10.038474
76	CHANGE_TEAM_MEMBER_STATUS	Change Team Member Status	تغيير حالة عضو الفريق	Change Team member account status	تغيير حالة حساب عضو الفريق	TEAM_MEMBERS	t	2026-02-09 23:03:10.038474	2026-02-09 23:03:10.038474
77	MANAGE_TEAM_MEMBER_BLOCK	Manage Team Member Block	إدارة حظر عضو الفريق	Block or unblock Team member account	حظر أو إلغاء حظر حساب عضو الفريق	TEAM_MEMBERS	t	2026-02-09 23:03:10.038474	2026-02-09 23:03:10.038474
78	ASSIGN_TEAM_ROLE	Assign Team Role	تعيين دور في الفريق	Assign role to team member	تعيين دور للعضو في الفريق	TEAM_MEMBERS	t	2026-02-09 23:03:10.038474	2026-02-09 23:03:10.038474
79	CHANGE_TEAM_ROLE	Change Team Role	تغيير دور عضو الفريق	Change team member role	تغيير دور العضو في الفريق	TEAM_MEMBERS	t	2026-02-09 23:03:10.038474	2026-02-09 23:03:10.038474
80	VIEW_TEAM_HISTORY	View Team Member History	عرض سجل عضو الفريق	View team member activity history	عرض سجل نشاط عضو الفريق	TEAM_MEMBERS	t	2026-02-09 23:03:10.038474	2026-02-09 23:03:10.038474
81	UPLOAD_TEAM_MEMBER_DOCUMENT	Upload Team Member Document	رفع مستندات عضو الفريق	Upload Team member documents	رفع مستندات عضو الفريق	TEAM_MEMBERS	t	2026-02-09 23:03:10.038474	2026-02-09 23:03:10.038474
82	DELETE_TEAM_MEMBER_DOCUMENT	Delete Team Member Document	حذف مستندات عضو الفريق	Delete Teammember documents	حذف مستندات عضو الفريق	TEAM_MEMBERS	t	2026-02-09 23:03:10.038474	2026-02-09 23:03:10.038474
83	PRINT_TEAM_MEMBER_DOCUMENT	Print Team Member Document	طباعة مستندات عضو الفريق	Print Team member documents	طباعة مستندات عضو الفريق	TEAM_MEMBERS	t	2026-02-09 23:03:10.038474	2026-02-09 23:03:10.038474
84	PRINT_TEAM_MEMBER_CARD	Print Team Member Card	طباعة كارنيه عضو الفريق	Print Team member card	طباعة كارنيه عضو الفريق	TEAM_MEMBERS	t	2026-02-09 23:03:10.038474	2026-02-09 23:03:10.038474
85	VIEW_TEAM_MEMBER_FORMS	View Team Member Forms	عرض استمارات عضو الفريق	View all forms submitted by Team members	عرض كل الاستمارات المقدمة من أعضاء الفرق	TEAM_MEMBERS	t	2026-02-09 23:03:10.038474	2026-02-09 23:03:10.038474
86	SUBMIT_TEAM_MEMBER_FORM	Submit Team Member Form	تقديم استمارة عضو الفريق	Submit a new form by Team member	تقديم استمارة جديدة من عضو الفريق	TEAM_MEMBERS	t	2026-02-09 23:03:10.038474	2026-02-09 23:03:10.038474
87	UPDATE_TEAM_MEMBER_FORM	Update Team Member Form	تعديل استمارة عضو الفريق	Update Team member form	تعديل استمارة عضو الفريق	TEAM_MEMBERS	t	2026-02-09 23:03:10.038474	2026-02-09 23:03:10.038474
88	DELETE_TEAM_MEMBER_FORM	Delete Team Member Form	حذف استمارة عضو الفريق	Delete Team member form	حذف استمارة عضو الفريق	TEAM_MEMBERS	t	2026-02-09 23:03:10.038474	2026-02-09 23:03:10.038474
89	VIEW_SPORTS	View Sports	عرض الرياضات	View sports	عرض الرياضات	SPORTS	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
90	CREATE_SPORT	Create Sport	إضافة رياضة	Create sport	إضافة رياضة	SPORTS	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
91	UPDATE_SPORT	Update Sport	تعديل رياضة	Edit sport	تعديل الرياضة	SPORTS	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
92	DELETE_SPORT	Delete Sport	حذف رياضة	Delete sport	حذف الرياضة	SPORTS	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
93	ASSIGN_SPORT_TO_MEMBER	Assign Sport to Member	تعيين رياضة لعضو	Assign sport to member	تعيين الرياضة للعضو	SPORTS	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
94	REMOVE_SPORT_FROM_MEMBER	Remove Sport from Member	إزالة رياضة من عضو	Remove sport from member	إزالة الرياضة من العضو	SPORTS	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
95	ASSIGN_SPORT_TO_TEAM_MEMBER	Assign Sport to Team Member	 تعيين رياضة لعضو الفريق	Assign sport to member	تعيين الرياضة لعضو الفريق	SPORTS	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
96	REMOVE_SPORT_FROM_TEAM_MEMBER	Remove Sport from Team Member	إزالة رياضة من عضو الفريق	Remove sport from member	إزالة الرياضة من العضوالفريق	SPORTS	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
97	CREATE_TEAM	Create Team	إنشاء فريق	Create sports team	إنشاء فريق رياضي	SPORTS	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
98	UPDATE_TEAM	Update Team	تعديل فريق	Edit sports team	تعديل الفريق	SPORTS	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
99	DELETE_TEAM	Delete Team	حذف فريق	Delete sports team	حذف الفريق	SPORTS	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
100	ASSIGN_MEMBER_TO_TEAM	Assign Member to Team	إضافة عضو لفريق	Assign member to team	إضافة عضو للفريق	SPORTS	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
101	REMOVE_MEMBER_FROM_TEAM	Remove Member from Team	إزالة عضو من فريق	Remove member from team	إزالة عضو من الفريق	SPORTS	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
102	SCHEDULE_MATCH	Schedule Match	جدولة مباراة	Schedule match	جدولة مباراة	SPORTS	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
103	VIEW_SPORT_PRICING	View Sport Pricing	عرض أسعار الأنشطة الرياضية	View sport pricing details	عرض أسعار الأنشطة الرياضية	SPORTS	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
104	CREATE_SPORT_PRICING	Create Sport Pricing	إضافة سعر لنشاط رياضي	Add pricing for a sport	إضافة سعر لنشاط رياضي	SPORTS	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
105	UPDATE_SPORT_PRICING	Update Sport Pricing	تعديل سعر نشاط رياضي	Update sport pricing	تعديل أسعار الأنشطة الرياضية	SPORTS	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
106	DELETE_SPORT_PRICING	Delete Sport Pricing	حذف سعر نشاط رياضي	Delete sport pricing	حذف أسعار الأنشطة الرياضية	SPORTS	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
107	VIEW_EVENTS	View Events	عرض الفعاليات	View all events	عرض كل الفعاليات	EVENTS	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
108	CREATE_EVENT	Create Event	إنشاء فعالية	Create new event	إنشاء فعالية جديدة	EVENTS	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
109	UPDATE_EVENT	Update Event	تعديل فعالية	Edit event	تعديل الفعالية	EVENTS	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
110	DELETE_EVENT	Delete Event	حذف فعالية	Delete event	حذف الفعالية	EVENTS	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
111	APPROVE_EVENT	Approve Event	اعتماد فعالية	Approve event	اعتماد الفعالية	EVENTS	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
112	CANCEL_EVENT	Cancel Event	إلغاء فعالية	Cancel event	إلغاء الفعالية	EVENTS	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
113	VIEW_EVENT_REGISTRATIONS	View Event Registrations	عرض تسجيلات الفعاليات	View event registrations	عرض تسجيلات الفعاليات	EVENTS	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
114	REGISTER_MEMBER_IN_EVENT	Register Member in Event	تسجيل عضو في فعالية	Register member in event	تسجيل عضو في الفعالية	EVENTS	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
115	CANCEL_EVENT_REGISTRATION	Cancel Event Registration	إلغاء تسجيل فعالية	Cancel event registration	إلغاء تسجيل الفعالية	EVENTS	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
116	VIEW_INVOICES	View Invoices	عرض الفواتير	View invoices	عرض الفواتير	FINANCE	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
117	CREATE_INVOICE	Create Invoice	إنشاء فاتورة	Create invoice	إنشاء فاتورة	FINANCE	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
118	UPDATE_INVOICE	Update Invoice	تعديل فاتورة	Edit invoice	تعديل الفاتورة	FINANCE	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
119	DELETE_INVOICE	Delete Invoice	حذف فاتورة	Delete invoice	حذف فاتورة	FINANCE	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
120	APPROVE_INVOICE	Approve Invoice	اعتماد فاتورة	Approve invoice	اعتماد الفاتورة	FINANCE	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
121	VIEW_PAYMENTS	View Payments	عرض المدفوعات	View payments	عرض المدفوعات	FINANCE	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
122	CREATE_PAYMENT	Create Payment	إضافة دفعة	Create payment	إضافة دفعة مالية	FINANCE	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
123	REFUND_PAYMENT	Refund Payment	استرداد دفعة	Refund payment	استرداد دفعة مالية	FINANCE	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
124	VIEW_BUDGETS	View Budgets	عرض الميزانيات	View budgets	عرض الميزانيات	FINANCE	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
125	EDIT_BUDGETS	Edit Budgets	تعديل الميزانيات	Edit budgets	تعديل الميزانيات	FINANCE	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
126	EXPORT_FINANCIAL_REPORTS	Export Financial Reports	تصدير التقارير المالية	Export financial reports	تصدير التقارير المالية	FINANCE	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
127	VIEW_MAINTENANCE_REQUESTS	View Maintenance Requests	عرض طلبات الصيانة	View maintenance requests	عرض طلبات الصيانة	MAINTENANCE	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
128	CREATE_MAINTENANCE_REQUEST	Create Maintenance Request	إنشاء طلب صيانة	Create maintenance request	إنشاء طلب صيانة	MAINTENANCE	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
129	UPDATE_MAINTENANCE_REQUEST	Update Maintenance Request	تعديل طلب صيانة	Edit maintenance request	تعديل طلب صيانة	MAINTENANCE	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
130	DELETE_MAINTENANCE_REQUEST	Delete Maintenance Request	حذف طلب صيانة	Delete maintenance request	حذف طلب صيانة	MAINTENANCE	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
131	ASSIGN_MAINTENANCE_TASK	Assign Maintenance Task	تعيين مهمة صيانة	Assign maintenance task to staff	تعيين مهمة صيانة لموظف	MAINTENANCE	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
132	APPROVE_MAINTENANCE_REQUEST	Approve Maintenance Request	اعتماد طلب صيانة	Approve maintenance request	اعتماد طلب الصيانة	MAINTENANCE	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
133	VIEW_MEDIA_CONTENT	View Media Content	عرض المحتوى الإعلامي	View media content	عرض المحتوى الإعلامي	MEDIA	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
134	CREATE_MEDIA_CONTENT	Create Media Content	إضافة محتوى إعلامي	Create media content	إضافة محتوى إعلامي	MEDIA	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
135	UPDATE_MEDIA_CONTENT	Update Media Content	تعديل المحتوى الإعلامي	Edit media content	تعديل المحتوى الإعلامي	MEDIA	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
136	DELETE_MEDIA_CONTENT	Delete Media Content	حذف محتوى إعلامي	Delete media content	حذف المحتوى الإعلامي	MEDIA	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
137	PUBLISH_MEDIA_CONTENT	Publish Media Content	نشر محتوى إعلامي	Publish media content	نشر المحتوى الإعلامي	MEDIA	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
138	MANAGE_PUBLIC_RELATIONS	Manage Public Relations	إدارة العلاقات العامة	Manage PR activities	إدارة العلاقات العامة	MEDIA	t	2026-02-09 23:26:35.174504	2026-02-09 23:26:35.174504
139	MEDIA_CENTER_CREATE	Create Media Center Ads	إنشاء إعلانات المركز الإعلامي	Allows creating new media center advertisements	يسمح بإنشاء إعلانات جديدة للمركز الإعلامي	MEDIA_CENTER	t	2026-02-13 20:46:48.451006	2026-02-13 20:46:48.451006
140	MEDIA_CENTER_PUBLISH	Publish Media Center Ads	نشر إعلانات المركز الإعلامي	Allows publishing approved advertisements directly	يسمح بنشر الإعلانات المعتمدة مباشرة	MEDIA_CENTER	t	2026-02-13 20:46:48.451006	2026-02-13 20:46:48.451006
141	MEDIA_CENTER_APPROVE	Approve Media Center Ads	اعتماد إعلانات المركز الإعلامي	Allows approving or rejecting pending advertisements	يسمح باعتماد أو رفض الإعلانات المعلقة	MEDIA_CENTER	t	2026-02-13 20:46:48.451006	2026-02-13 20:46:48.451006
142	MEDIA_CENTER_EDIT	Edit Media Center Ads	تعديل إعلانات المركز الإعلامي	Allows editing pending advertisements	يسمح بتعديل الإعلانات المعلقة	MEDIA_CENTER	t	2026-02-13 20:46:48.451006	2026-02-13 20:46:48.451006
143	MEDIA_CENTER_DELETE	Delete Media Center Ads	حذف إعلانات المركز الإعلامي	Allows deleting advertisements	يسمح بحذف الإعلانات	MEDIA_CENTER	t	2026-02-13 20:46:48.451006	2026-02-13 20:46:48.451006
144	MEDIA_CENTER_MANAGE_CATEGORIES	Manage Media Center Categories	إدارة تصنيفات المركز الإعلامي	Allows managing advertisement categories	يسمح بإدارة تصنيفات الإعلانات	MEDIA_CENTER	t	2026-02-13 20:46:48.451006	2026-02-13 20:46:48.451006
145	media.view	View Media	عرض الوسائط	\N	\N	MediaGallery	t	2026-02-16 07:53:30.82323	2026-02-16 07:53:30.82323
146	media.create	Create Media	إضافة وسائط	\N	\N	MediaGallery	t	2026-02-16 07:53:31.852207	2026-02-16 07:53:31.852207
147	media.edit	Edit Media	تعديل الوسائط	\N	\N	MediaGallery	t	2026-02-16 07:53:32.16393	2026-02-16 07:53:32.16393
148	media.delete	Delete Media	حذف الوسائط	\N	\N	MediaGallery	t	2026-02-16 07:53:32.435094	2026-02-16 07:53:32.435094
149	APPROVE_SPORT_SUBSCRIPTION	Approve Sport Subscription	اعتماد طلب الاشتراك في الرياضة	Allows approving, declining, or cancelling member and team member sport subscription requests	يسمح باعتماد أو رفض أو إلغاء طلبات اشتراك الأعضاء وأعضاء الفريق في الرياضات	SPORTS	t	2026-02-25 04:01:12.760069	2026-02-25 04:01:12.760069
\.


--
-- Data for Name: privileges_packages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.privileges_packages (privilege_id, package_id) FROM stdin;
1	3
1	4
1	5
2	3
2	4
2	5
3	3
3	4
3	5
4	3
4	4
4	5
5	3
5	4
5	5
6	3
6	4
6	5
7	3
7	4
7	5
8	3
8	4
8	5
10	3
10	4
10	5
11	3
11	4
11	5
12	3
12	4
12	5
13	3
13	4
13	5
14	3
14	4
14	5
15	3
15	4
15	5
16	3
16	4
16	5
17	3
17	4
17	5
18	3
18	4
18	5
19	3
19	4
19	5
20	3
20	4
20	5
21	3
21	4
21	5
22	3
22	4
22	5
23	3
23	4
23	5
24	3
24	4
24	5
25	3
25	4
25	5
26	3
26	4
26	5
27	3
27	4
27	5
28	3
28	4
28	5
29	3
29	4
29	5
30	3
30	4
30	5
31	3
31	4
31	5
32	3
32	4
32	5
33	3
33	4
33	5
34	3
34	4
34	5
35	3
35	4
35	5
36	3
36	4
36	5
37	3
37	4
37	5
38	3
38	4
38	5
39	3
39	4
39	5
40	3
40	4
40	5
41	3
41	4
41	5
42	3
42	4
42	5
43	3
43	4
43	5
44	3
44	4
44	5
45	3
45	4
45	5
46	3
46	4
46	5
47	3
47	4
47	5
48	3
48	4
48	5
49	3
49	4
49	5
50	3
50	4
50	5
51	3
51	4
51	5
52	3
52	4
52	5
53	3
53	4
53	5
54	3
54	4
54	5
55	3
55	4
55	5
56	3
56	4
56	5
57	3
57	4
57	5
58	3
58	4
58	5
59	3
59	4
59	5
60	3
60	4
60	5
61	3
61	4
61	5
62	3
62	4
62	5
63	3
63	4
63	5
64	3
64	4
64	5
65	3
65	4
65	5
66	3
66	4
66	5
67	3
67	4
67	5
68	3
68	4
68	5
69	3
69	4
69	5
70	3
70	4
70	5
71	3
71	4
71	5
72	3
72	4
72	5
73	3
73	4
73	5
74	3
74	4
74	5
75	3
75	4
75	5
76	3
76	4
76	5
77	3
77	4
77	5
78	3
78	4
78	5
79	3
79	4
79	5
80	3
80	4
80	5
81	3
81	4
81	5
82	3
82	4
82	5
83	3
83	4
83	5
84	3
84	4
84	5
85	3
85	4
85	5
86	3
86	4
86	5
87	3
87	4
87	5
88	3
88	4
88	5
89	3
89	4
89	5
90	3
90	4
90	5
91	3
91	4
91	5
92	3
92	4
92	5
93	3
93	4
93	5
94	3
94	4
94	5
95	3
95	4
95	5
96	3
96	4
96	5
97	3
97	4
97	5
98	3
98	4
98	5
99	3
99	4
99	5
100	3
100	4
100	5
101	3
101	4
101	5
102	3
102	4
102	5
103	3
103	4
103	5
104	3
104	4
104	5
105	3
105	4
105	5
106	3
106	4
106	5
107	3
107	4
107	5
108	3
108	4
108	5
109	3
109	4
109	5
110	3
110	4
110	5
111	3
111	4
111	5
112	3
112	4
112	5
113	3
113	4
113	5
114	3
114	4
114	5
115	3
115	4
115	5
116	3
116	4
116	5
117	3
117	4
117	5
118	3
118	4
118	5
119	3
119	4
119	5
120	3
120	4
120	5
121	3
121	4
121	5
122	3
122	4
122	5
123	3
123	4
123	5
124	3
124	4
124	5
125	3
125	4
125	5
126	3
126	4
126	5
127	3
127	4
127	5
128	3
128	4
128	5
129	3
129	4
129	5
130	3
130	4
130	5
131	3
131	4
131	5
132	3
132	4
132	5
133	3
133	4
133	5
134	3
134	4
134	5
135	3
135	4
135	5
136	3
136	4
136	5
137	3
137	4
137	5
138	3
138	4
138	5
139	6
140	6
141	6
142	6
143	6
144	6
145	1
146	1
147	1
148	1
139	5
140	5
141	5
142	5
143	5
144	5
145	5
146	5
147	5
148	5
111	2
112	2
115	2
108	2
110	2
114	2
109	2
113	2
107	2
8	2
7	2
26	2
15	2
25	2
13	2
16	2
11	2
19	2
21	2
27	2
28	2
17	2
14	2
23	2
22	2
12	2
10	2
18	2
24	2
20	2
49	7
47	7
48	7
46	7
61	7
58	7
60	7
59	7
57	7
37	7
34	7
43	7
38	7
41	7
45	7
44	7
39	7
36	7
35	7
42	7
40	7
33	7
55	7
56	7
54	7
51	7
53	7
52	7
50	7
81	7
87	7
85	7
84	7
83	7
82	7
88	7
66	8
63	8
65	8
64	8
62	8
120	8
117	8
122	8
119	8
125	8
126	8
123	8
118	8
124	8
116	8
121	8
111	8
112	8
115	8
108	8
110	8
114	8
109	8
113	8
107	8
8	8
7	8
141	8
139	8
143	8
142	8
144	8
140	8
8	9
7	9
111	9
112	9
115	9
108	9
110	9
114	9
109	9
113	9
107	9
115	10
8	10
7	10
111	10
112	10
114	10
109	10
108	10
113	10
110	10
107	10
49	10
47	10
48	10
46	10
61	10
58	10
60	10
59	10
57	10
37	10
34	10
43	10
38	10
41	10
45	10
44	10
39	10
36	10
35	10
42	10
40	10
33	10
149	5
\.


--
-- Data for Name: professions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.professions (id, code, name_en, name_ar, created_at, updated_at) FROM stdin;
1	EMP	Employee	الموظف	2026-01-25 23:33:05.156145	2026-01-25 23:33:05.156145
2	DEM	Demonstrator	المعيد	2026-01-25 23:33:05.156145	2026-01-25 23:33:05.156145
3	AST_LEC	Assistant Lecturer	المدرس المساعد	2026-01-25 23:33:05.156145	2026-01-25 23:33:05.156145
4	FAC_MEM	Faculty Member	عضو هيئة التدريس	2026-01-25 23:33:05.156145	2026-01-25 23:33:05.156145
\.


--
-- Data for Name: retired_employee_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.retired_employee_details (id, member_id, former_department_en, former_department_ar, retirement_date, salary_slip, created_at, updated_at, profession_code, last_salary) FROM stdin;
1	68	cs	cs	2020-06-06	\N	2026-02-17 21:05:14.288326	2026-02-17 21:05:14.288326	\N	\N
2	114	cs	cs	2025-11-11	\N	2026-02-21 19:56:49.104277	2026-02-21 19:56:49.104277	\N	\N
3	120	IT	IT	2025-02-22	\N	2026-02-21 20:31:51.922317	2026-02-21 20:31:51.922317	\N	\N
4	121	cs	cs	2000-11-11	\N	2026-02-21 20:36:22.670359	2026-02-21 20:36:22.670359	\N	\N
5	122	cs	cs	1999-11-11	\N	2026-02-21 20:42:23.599677	2026-02-21 20:42:23.599677	\N	\N
6	123	cs	cs	2026-11-22	\N	2026-02-21 20:52:31.402424	2026-02-21 20:52:31.402424	\N	\N
7	136	hjhghgh	hjhghgh	2025-11-12	\N	2026-02-21 22:41:27.03851	2026-02-21 22:41:27.03851	\N	\N
8	149	النيجاز	النيجاز	2026-02-05	\N	2026-02-24 00:53:14.427414	2026-02-24 00:53:14.427414	\N	\N
\.


--
-- Data for Name: sport_branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sport_branches (id, sport_id, branch_id, created_by_staff_id, status, status_reason, is_enrollment_open, enrollment_start_date, enrollment_end_date, notes, created_at) FROM stdin;
\.


--
-- Data for Name: sports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sports (id, name_en, name_ar, description_en, description_ar, price, status, created_by_staff_id, approved_by_staff_id, approved_at, approval_comments, max_participants, is_active, created_at, updated_at, sport_image) FROM stdin;
5	FootBall	Football	\N	\N	12345.00	active	1	1	2026-02-16 00:27:57.264	\N	0	t	2026-02-15 22:27:57.830153	2026-02-15 22:27:57.830153	\N
7	Swim	Swim	\N	\N	1230.00	active	1	1	2026-02-16 21:42:40.416	\N	0	t	2026-02-16 19:42:41.429674	2026-02-16 19:42:41.429674	\N
8	Scorore	كوره اجنبيه	\N	\N	3000.00	active	1	1	2026-02-17 14:48:31.484	\N	0	t	2026-02-17 12:48:32.205237	2026-02-17 12:49:34.228769	\N
10	Gymnastics	جمباز	\N	\N	2000.00	active	1	1	2026-02-21 16:16:57.259	\N	0	t	2026-02-21 14:16:57.562465	2026-02-21 14:16:57.562465	\N
3	Basketball	كرة سلة	\N	\N	60.00	active	1	1	2026-02-15 01:22:13.555	\N	0	t	2026-02-14 23:22:13.718438	2026-02-23 04:30:26.735992	\N
6	Swimmm	سباح	\N	\N	12345.00	active	1	1	2026-02-16 00:56:34.047	\N	0	t	2026-02-15 22:56:34.678292	2026-02-24 03:16:30.288172	\N
13	z3ln	زعلن	\N	\N	0.00	active	1	1	2026-02-25 06:37:36.429	\N	0	t	2026-02-25 04:37:36.614731	2026-03-01 03:53:47.081425	\N
\.


--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff (id, account_id, staff_type_id, first_name_en, first_name_ar, last_name_en, last_name_ar, national_id, phone, address, employment_start_date, employment_end_date, status, is_active, created_at, updated_at) FROM stdin;
2	34	2	Executive	المدير	Manager	التنفيذي	97965432101234	0988754321	\N	2024-01-15	\N	pending	t	2026-02-04 02:19:57.559289	2026-02-04 02:19:57.559289
3	35	3	DEPExecutive	نائب المدير	Manager	التنفيذي	97965402101234	0988754321	\N	2024-01-15	\N	pending	t	2026-02-04 02:24:01.340756	2026-02-04 02:24:01.340756
4	36	8	Finance	المدير	Manager	الشئون المالية	97922402101234	0988758821	\N	2024-01-15	\N	active	t	2026-02-04 02:33:08.586025	2026-02-04 02:33:08.586025
39	216	2	zeyad	زيادد	alaa	علاء	01232423235898	01233333333	حلوان	2026-01-01	2030-11-27	active	t	2026-02-22 00:21:29.828755	2026-02-22 00:27:38.382962
5	37	3	Ahmed	احمد	Mohamed	محمد	12345677901234	01009876543	456 New Address, Cairo	2024-01-15	2026-12-31	inactive	f	2026-02-04 15:03:01.690162	2026-02-05 03:09:57.287506
27	114	9	Stafffffffff	ععععع	St	ععععع	11223377889955	01000100698	El-Shareef, Hadayek Helwan, El Masara, Cairo Governorate	2000-02-22	2030-02-22	inactive	f	2026-02-18 11:38:33.460947	2026-02-22 04:40:40.611213
6	38	3	Yara	يارا	Ahmed	احمد	12345678901224	01001234567	123 Cairo Street, Cairo	2024-01-15	2025-12-31	active	f	2026-02-05 03:17:16.8574	2026-02-05 04:31:44.361147
7	43	19	Ahmed	أحمد	Hassan	حسن	29901011234567	+201234567890	Cairo, Egypt	2024-01-01	\N	active	t	2026-02-07 09:00:14.650671	2026-02-07 09:00:14.650671
8	44	20	Sara	سارة	Ali	علي	29902021234568	+201234567891	Giza, Egypt	2024-02-01	\N	active	t	2026-02-07 09:00:16.328295	2026-02-07 09:00:16.328295
11	53	6	Yara	يارا	Ahmed	أحمد	123456789991234	01001234567	123 Cairo Street, Cairo	2024-01-15	2025-12-31	active	t	2026-02-13 22:02:42.911557	2026-02-13 22:02:42.911557
13	68	1	System	System	Admin	Admin	29001011234567	+201234567890	Cairo, Egypt	2024-01-01	\N	active	t	2026-02-15 03:49:04.596344	2026-02-15 03:49:04.596344
14	69	3	Zeyad	zeyad	Alaa	Alaa	30501050161789	01151031404	qwertyuiopoiuytre	2026-02-28	\N	active	t	2026-02-15 22:30:13.250674	2026-02-15 22:30:13.250674
15	70	3	Zeyad Alaa	Zeyad Alaa	Zeyad Alaa	Zeyad Alaa	12345678912345	01151031404	qwertyuioppp;lkjhgf	2026-02-02	\N	active	t	2026-02-15 23:05:39.44319	2026-02-15 23:05:39.44319
16	71	1	Zed	Zed	Alaa	Alaa	01234567891234	01151031404	qwertyuikmnbvcxzasdfg	2026-02-28	\N	active	t	2026-02-15 23:24:26.455869	2026-02-15 23:24:26.455869
17	72	1	Zed	Zed	Alaa	Alaa	01234567891244	01151031404	qwertyuikmnbvcxzasdfg	2026-02-28	\N	active	t	2026-02-15 23:34:33.518907	2026-02-15 23:34:33.518907
18	73	1	Zed	Zed	Alaa	Alaa	01234567891344	01151031404	qwertyuikmnbvcxzasdfg	2026-02-28	\N	active	t	2026-02-15 23:35:10.101188	2026-02-15 23:35:10.101188
19	74	1	Zed	Zed	Alaa	Alaa	01244567891344	01151031404	qwertyuikmnbvcxzasdfg	2026-02-28	\N	active	t	2026-02-15 23:39:08.242092	2026-02-15 23:39:08.242092
20	75	21	Media	المسؤول	Specialist	الإعلامي	99999999999999	+201000000000	Club Media Office	2026-02-16	\N	active	t	2026-02-16 07:53:33.860845	2026-02-16 07:53:33.860845
21	83	10	tester	تيتسر	tototot	توتو	15619830651616	+2010138917	10 el ganzori	2026-02-17	2026-02-24	active	t	2026-02-17 14:04:11.044039	2026-02-17 14:04:11.044039
22	84	5	Mobamba	محمد	Lamba	لمبه	11111111111111	01011379811	اومبا	2026-02-19	2026-02-25	active	t	2026-02-17 16:09:34.715536	2026-02-17 16:09:34.715536
23	91	13	Yarab	يارب	Working	يشتغلل	11111111111112	01013781777	Yarab Working	2026-02-11	2026-02-25	active	t	2026-02-17 17:24:10.969443	2026-02-17 17:24:10.969443
24	92	7	MoMo	مومو	MOMOPM	بوبوبو	13333333333333	01011379817	paowdopawjdpoajopwdjawjdawdo	2026-02-04	2026-02-25	active	t	2026-02-17 17:30:46.562515	2026-02-17 17:30:46.562515
25	93	6	Testing 	بجرب	privalgeings	صلحيات	11111111111123	01011379717	Privliages	2026-02-03	2026-02-24	active	t	2026-02-17 18:39:33.349447	2026-02-17 18:39:33.349447
26	102	1	ZZeed	جامعة	Alaa	حلوان	01234567890123	01151031404	asdfghjkiuytre	2026-02-01	\N	active	t	2026-02-17 22:36:41.102959	2026-02-17 22:36:41.102959
28	115	9	Staffffffffffff	ععععع	St	ععععع	11223377889959	01000100698	El-Shareef, Hadayek Helwan, El Masara, Cairo Governorate	2000-02-22	2030-02-22	active	t	2026-02-18 11:45:12.496485	2026-02-18 11:45:12.496485
29	116	9	Stafffffffffffff	ععععع	St	ععععع	11223377884444	01000100698	El-Shareef, Hadayek Helwan, El Masara, Cairo Governorate	2000-02-22	2030-02-22	active	t	2026-02-18 11:47:12.742396	2026-02-18 11:47:12.742396
30	117	9	Stafftwo	ععععع	St	ععععع	11223377889999	01000100698	El-Shareef, Hadayek Helwan, El Masara, Cairo Governorate	2000-02-22	2030-02-22	active	t	2026-02-18 11:51:52.8697	2026-02-18 11:51:52.8697
31	118	2	CEO NEWW	ععععع	kkkkk	ععععع	11447788552266	01151031404	El-Shareef, Hadayek Helwan, El Masara, Cairo Governorate	1999-11-11	\N	active	t	2026-02-18 12:08:33.238078	2026-02-18 12:08:33.238078
32	119	9	Zeyad	ععععع	KKKK	ععععع	11447755882299	01151031404	asdfghjkiuytre	2000-11-12	\N	active	t	2026-02-18 13:36:16.037731	2026-02-18 13:36:16.037731
33	128	2	Nigger 	نيجر	migger	ميجر	22222222222222	01011379817	Cariro Festibval City	2026-02-19	2026-03-05	active	t	2026-02-19 23:30:08.028191	2026-02-19 23:30:08.028191
34	129	7	Mo	مو	MOMOM	مومو	12444444444444	01013378171	Cairo111	2026-02-11	2026-02-17	active	t	2026-02-20 13:24:04.42161	2026-02-20 13:24:04.42161
35	130	7	Mo	مو	MOMOM	مومو	12444444444443	01013378171	Cairo111	2026-02-11	2026-02-17	active	t	2026-02-20 13:27:36.076704	2026-02-20 13:27:36.076704
36	131	7	Mahmoud	محمود	Hesham	هشام	11111111111131	01011111111	Cairrooo	2026-02-05	2026-02-27	active	t	2026-02-20 14:50:24.202896	2026-02-20 14:50:24.202896
37	132	4	testing	تيست	testintinitn	تيتستستس	11111131313131	01011379177	Ciaroooo	2026-02-26	2026-03-01	active	t	2026-02-20 14:55:41.209707	2026-02-20 14:55:41.209707
12	54	2	kerolos 	كيرلس	maged	ماجد	30305216333333	01210285959	fggfgsgff	2025-12-11	2026-05-14	inactive	f	2026-02-14 08:16:34.682404	2026-02-20 19:54:50.319929
1	31	1	Admin	مسؤول	User	مستخدم	12345678901234	0123456789	Cairo	2026-02-04	\N	active	t	2026-02-04 02:14:53.707081	2026-02-20 20:21:35.944868
38	166	9	Yara	يارا	Ahmed	احمد	77446699330011	01022345678	wadi houf	1999-11-11	2030-02-22	active	t	2026-02-21 14:27:20.492571	2026-02-21 14:27:20.492571
40	218	24	Admin	مسؤول	User	المستخدم	00000000000000	+20100000000	Admin Address	2026-02-22	\N	active	t	2026-02-22 13:03:46.210526	2026-02-22 13:03:46.210526
41	222	3	Trying privg	بجرب	trying	بجبجبجبج	12222222111111	01001010010	Bgrb	2026-02-11	\N	active	t	2026-02-22 22:37:30.683888	2026-02-22 22:37:30.683888
42	223	7	Less staff	ستف اقل	Less	ليسسس	12413111111111	01017312371	CAURIRIRIRIRI	2026-02-11	\N	active	t	2026-02-22 22:58:43.739493	2026-02-22 22:58:43.739493
43	224	7	YaraStaff	يارا	Stafff	ستاغغغ	41231241241241	01011312837	Wadi hoof	2026-02-12	\N	active	t	2026-02-22 23:33:46.655144	2026-02-22 23:33:46.655144
44	246	5	Testing Date 	تيست	Dateee	ديييت	12381924812948	01013718923	CAIROOOOOOO	2026-02-19	\N	active	t	2026-02-25 04:05:01.926506	2026-02-25 04:05:01.926506
\.


--
-- Data for Name: staff_action_approvals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff_action_approvals (id, staff_id, action_type, action_data, status, submitted_by, approved_by, approval_comments, submitted_at, approved_at, created_at, updated_at) FROM stdin;
1	6	CREATE_STAFF	{"phone": "01001234567", "address": "123 Cairo Street, Cairo", "national_id": "12345678901234", "last_name_ar": "محمد", "last_name_en": "Mohamed", "first_name_ar": "وائل", "first_name_en": "Wael", "staff_type_id": 4, "employment_end_date": "2025-12-31T00:00:00.000Z", "employment_start_date": "2024-01-15T00:00:00.000Z", "created_by_staff_type_id": 3}	approved	6	2		2026-02-05 06:40:26.749	2026-02-05 06:43:15.473	2026-02-05 04:40:27.972547	2026-02-05 04:43:15.964836
\.


--
-- Data for Name: staff_activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff_activity_logs (id, staff_id, action_type, description, performed_by, created_at) FROM stdin;
\.


--
-- Data for Name: staff_package_privileges; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff_package_privileges (package_id, privilege_id, added_at, added_by) FROM stdin;
6	141	2026-02-13 23:47:02.921753	\N
6	139	2026-02-13 23:47:03.049887	\N
6	143	2026-02-13 23:47:03.170005	\N
6	142	2026-02-13 23:47:03.339405	\N
6	144	2026-02-13 23:47:03.489207	\N
6	140	2026-02-13 23:47:03.571182	\N
\.


--
-- Data for Name: staff_packages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff_packages (staff_id, package_id, assigned_at, assigned_by) FROM stdin;
3	4	2026-02-05 02:20:48.604738	1
1	5	2026-02-10 03:43:15.778693	1
11	6	2026-02-13 22:05:11.134218	1
12	4	2026-02-14 08:16:35.766984	1
12	5	2026-02-14 08:16:35.887438	1
12	6	2026-02-14 08:16:36.005195	1
12	3	2026-02-14 08:16:36.123151	1
14	4	2026-02-15 22:30:13.704667	1
15	5	2026-02-15 23:05:39.904775	1
19	5	2026-02-15 23:39:09.502994	1
20	1	2026-02-16 07:53:34.228313	\N
21	1	2026-02-17 14:04:14.178793	1
24	3	2026-02-17 18:36:17.940115	1
24	1	2026-02-17 18:36:18.037617	1
26	5	2026-02-17 22:36:42.394843	1
29	5	2026-02-18 11:47:15.555354	1
30	6	2026-02-18 11:51:55.750678	1
31	3	2026-02-18 12:08:36.926692	1
23	5	2026-02-19 23:28:36.824173	1
33	5	2026-02-19 23:30:09.469854	1
35	4	2026-02-20 13:27:38.106976	1
36	5	2026-02-20 14:50:25.754542	1
37	5	2026-02-20 14:55:42.490931	1
38	7	2026-02-21 14:27:21.628889	1
39	5	2026-02-22 00:30:15.717889	1
39	4	2026-02-22 00:30:15.841169	1
41	5	2026-02-22 22:37:32.031475	1
42	1	2026-02-22 22:58:46.718697	1
43	7	2026-02-22 23:35:15.640699	1
44	10	2026-02-25 04:05:03.593922	1
\.


--
-- Data for Name: staff_privileges_override; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff_privileges_override (staff_id, privilege_id, is_granted, assigned_at, assigned_by) FROM stdin;
4	104	f	2026-02-05 02:58:39.975303	1
4	103	t	2026-02-05 02:58:39.975303	1
24	34	t	2026-02-17 18:12:55.855791	1
24	38	t	2026-02-17 18:12:56.936228	1
24	39	t	2026-02-17 18:12:59.095866	1
24	41	t	2026-02-17 18:12:59.987607	1
24	37	t	2026-02-17 18:13:01.144459	1
24	35	t	2026-02-17 18:13:02.124185	1
24	43	t	2026-02-17 18:13:03.150559	1
24	42	t	2026-02-17 18:13:04.591081	1
24	45	t	2026-02-17 18:13:05.576874	1
24	44	t	2026-02-17 18:13:06.763067	1
24	40	t	2026-02-17 18:13:07.582744	1
24	33	t	2026-02-17 18:13:08.768916	1
24	36	t	2026-02-17 18:13:10.017208	1
38	63	t	2026-02-21 14:27:22.656437	1
38	65	t	2026-02-21 14:27:23.103282	1
38	62	t	2026-02-21 14:27:23.553902	1
38	64	t	2026-02-21 14:27:23.97722	1
38	66	t	2026-02-21 14:27:24.413027	1
\.


--
-- Data for Name: staff_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff_types (id, code, name_en, name_ar, description_en, description_ar, is_active, created_at, updated_at) FROM stdin;
1	ADMIN	Admin	المسئول	Responsible for overall management	مسئول عن الإدارة العامة.	t	2026-02-04 02:14:18.516507	2026-02-04 02:14:18.516507
2	CEO	Executive Director	المدير التنفيذى	Responsible for overall management and strategic direction of the organization.	مسئول عن الإدارة العامة ووضع الاستراتيجيات والإشراف على جميع أنشطة المؤسسة.	t	2026-02-04 02:14:18.516507	2026-02-04 02:14:18.516507
3	DEPUTY_CEO	Deputy Executive Director	نائب المدير التنفيذى	Assists the Executive Director and oversees operations in their absence.	يساعد المدير التنفيذي ويتولى الإشراف على العمليات في حال غيابه.	t	2026-02-04 02:14:18.516507	2026-02-04 02:14:18.516507
4	EVENTS_MANAGER	Events and Activities Manager	مدير الفاعليات والاحداث	Plans, organizes, and supervises events and activities.	مسئول عن تخطيط وتنظيم والإشراف على الفعاليات والأنشطة.	t	2026-02-04 02:14:18.516507	2026-02-04 02:14:18.516507
5	EXEC_SECRETARY_MANAGER	Executive Secretariat Manager	مدير السكرتارية التنفيذىة	Manages executive secretarial tasks and administrative coordination.	مسئول عن إدارة أعمال السكرتارية التنفيذية والتنسيق الإداري.	t	2026-02-04 02:14:18.516507	2026-02-04 02:14:18.516507
6	MEDIA_CENTER_MANAGER	Media Center Manager	مدير المركز الاعلامى	Oversees media operations and communication strategies.	يشرف على أعمال المركز الإعلامي واستراتيجيات التواصل.	t	2026-02-04 02:14:18.516507	2026-02-04 02:14:18.516507
7	SPORT_ACTIVITY_SPECIALIST	Sports Activity Specialist	اخصائى النشاط الرياضى	Implements and monitors sports activities and programs.	مسئول عن تنفيذ ومتابعة الأنشطة الرياضية والبرامج الرياضية.	t	2026-02-04 02:14:18.516507	2026-02-04 02:14:18.516507
8	FINANCE_MANAGER	Finance Manager	مدير الشئون المالية	Manages financial operations, budgets, and reports.	مسئول عن إدارة العمليات المالية والميزانيات والتقارير المالية.	t	2026-02-04 02:14:18.516507	2026-02-04 02:14:18.516507
9	HR_MEMBERSHIP_MANAGER	HR and Membership Affairs Manager	مدير الموارد البشرية وشئون العضوية	Manages human resources and membership affairs.	مسئول عن إدارة الموارد البشرية وشئون العضوية.	t	2026-02-04 02:14:18.516507	2026-02-04 02:14:18.516507
10	CONTRACTS_MANAGER	Contracts Manager	مدير التعاقدات	Handles contracts, agreements, and negotiations.	مسئول عن إدارة التعاقدات والاتفاقيات والتفاوض.	t	2026-02-04 02:14:18.516507	2026-02-04 02:14:18.516507
11	MAINTENANCE_MANAGER	Maintenance Manager	مدير الصيانة	Supervises maintenance operations and facilities management.	مسئول عن الإشراف على أعمال الصيانة وإدارة المرافق.	t	2026-02-04 02:14:18.516507	2026-02-04 02:14:18.516507
12	SPORT_ACTIVITY_MANAGER	Sports Activity Manager	مدير النشاط الرياضى	Leads and supervises sports activity departments.	مسئول عن قيادة والإشراف على إدارة النشاط الرياضي.	t	2026-02-04 02:14:18.516507	2026-02-04 02:14:18.516507
13	SOCIAL_ACTIVITY_MANAGER	Social Activity Manager	مدير النشاط الاجتماعى	Organizes and supervises social activities and events.	مسئول عن تنظيم والإشراف على الأنشطة الاجتماعية.	t	2026-02-04 02:14:18.516507	2026-02-04 02:14:18.516507
14	PR_MANAGER	Public Relations Manager	مدير العلاقات العامة	Manages public relations and external communications.	مسئول عن إدارة العلاقات العامة والتواصل الخارجي.	t	2026-02-04 02:14:18.516507	2026-02-04 02:14:18.516507
15	MEDIA_CENTER_SPECIALIST	Media Center Specialist	اخصائى المركز الاعلامى	Executes media tasks and supports media operations.	مسئول عن تنفيذ الأعمال الإعلامية ودعم أنشطة المركز الإعلامي.	t	2026-02-04 02:14:18.516507	2026-02-04 02:14:18.516507
16	MAINTENANCE_OFFICER	Maintenance Officer	مسئول الصيانة	Performs maintenance tasks and reports issues.	مسئول عن تنفيذ أعمال الصيانة والإبلاغ عن الأعطال.	t	2026-02-04 02:14:18.516507	2026-02-04 02:14:18.516507
17	ADMIN_OFFICER	Administrative Affairs Officer	مسئول الشئون الادارية	Handles administrative tasks and office operations.	مسئول عن تنفيذ الأعمال الإدارية وإدارة شؤون المكتب.	t	2026-02-04 02:14:18.516507	2026-02-04 02:14:18.516507
18	SUPPORT_SERVICES	Support Services	خدمات معاونة	Provides auxiliary and support services to different departments.	مسئول عن تقديم الخدمات المساعدة والداعمة لمختلف الإدارات.	t	2026-02-04 02:14:18.516507	2026-02-04 02:14:18.516507
19	SPORT_MANAGER	Sport Activity Manager	مدير الأنشطة الرياضية	Can create sports with active status, approve pending sports, set prices, and manage all sport activities	يمكنه إنشاء رياضات بحالة نشطة، الموافقة على الرياضات المعلقة، تحديد الأسعار، وإدارة جميع الأنشطة الرياضية	t	2026-02-06 21:00:15.76056	2026-02-06 21:00:15.76056
20	SPORT_SPECIALIST	Sport Activity Specialist	أخصائي الأنشطة الرياضية	Can create sports with pending status (requires manager approval), cannot set prices	يمكنه إنشاء رياضات بحالة معلقة (تتطلب موافقة المدير)، لا يمكنه تحديد الأسعار	t	2026-02-06 21:00:15.76056	2026-02-06 21:00:15.76056
21	MEDIA	Media Specialist	المسؤول الإعلامي	Responsible for media and communications	مسؤول عن الإعلام والتواصل	t	2026-02-16 07:53:30.320944	2026-02-16 07:53:30.320944
24	EXECUTIVE_MANAGER	EXECUTIVE_MANAGER	مدير تنفيذي	\N	\N	t	2026-02-22 13:03:45.490682	2026-02-22 13:03:45.490682
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, title, description, status, data, created_by, assigned_to, created_at, updated_at, type) FROM stdin;
1	طلب اشتراك رياضي	طلب اشتراك في: جمباز	rejected	{"member_id": 157, "sport_ids": [10], "sport_names": [{"id": 10, "name_ar": "جمباز", "name_en": "Gymnastics"}]}	موسمي تيستر	\N	2026-02-24 21:53:05.918298	2026-02-24 21:53:44.537095	GENERAL
2	طلب اشتراك رياضي	طلب اشتراك في: Swim	approved	{"member_id": 157, "sport_ids": [7], "sport_names": [{"id": 7, "name_ar": "Swim", "name_en": "Swim"}]}	موسمي تيستر	\N	2026-02-24 21:53:59.532424	2026-02-24 21:54:15.051151	GENERAL
3	طلب اشتراك رياضي	طلب اشتراك في: Football، كرة سلة	rejected	{"member_id": 154, "sport_ids": [5, 3], "sport_names": [{"id": 5, "name_ar": "Football", "name_en": "FootBall"}, {"id": 3, "name_ar": "كرة سلة", "name_en": "Basketball"}]}	محمود الدرة	\N	2026-02-24 21:55:59.341081	2026-02-24 21:59:55.241784	GENERAL
4	طلب اشتراك رياضي	طلب اشتراك في رياضة: جمباز	pending	{"price": 2000, "sport_id": 10, "member_id": 112, "request_date": "2026-02-24", "sport_name_ar": "جمباز", "sport_name_en": "Gymnastics"}	محمد	\N	2026-02-24 23:29:37.425962	2026-02-24 23:29:37.425962	GENERAL
5	طلب اشتراك رياضي	طلب اشتراك في رياضة: كوره اجنبيه	pending	{"price": 3000, "sport_id": 8, "member_id": 157, "request_date": "2026-02-24", "sport_name_ar": "كوره اجنبيه", "sport_name_en": "Scorore"}	موسمي	\N	2026-02-24 23:36:10.527229	2026-02-24 23:36:10.527229	GENERAL
\.


--
-- Data for Name: team_member_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.team_member_details (id, status, created_at, updated_at, "position", team_member_id) FROM stdin;
1	active	2026-01-27 16:14:32.441311	2026-01-27 16:14:32.441311	player	\N
2	active	2026-01-27 16:14:55.360073	2026-01-27 16:14:55.360073	player	\N
3	active	2026-01-28 15:44:16.687933	2026-01-28 15:44:16.687933	player	\N
4	active	2026-01-28 17:19:34.093481	2026-01-28 17:19:34.093481	player	\N
5	active	2026-02-06 16:18:47.401858	2026-02-06 16:18:47.401858	player	\N
6	active	2026-02-06 16:28:11.009382	2026-02-06 16:28:11.009382	player	\N
7	active	2026-02-06 16:31:58.184324	2026-02-06 16:31:58.184324	player	\N
8	active	2026-02-17 23:47:32.486829	2026-02-17 23:47:32.486829	player	\N
9	active	2026-02-19 08:30:03.289678	2026-02-19 08:30:03.289678	player	\N
10	active	2026-02-19 10:52:33.994047	2026-02-19 10:52:33.994047	player	\N
11	active	2026-02-19 11:10:45.793309	2026-02-19 11:10:45.793309	player	\N
12	active	2026-02-19 11:17:28.495651	2026-02-19 11:17:28.495651	player	\N
13	active	2026-02-19 11:28:52.130741	2026-02-19 11:28:52.130741	player	\N
14	active	2026-02-19 11:41:45.771563	2026-02-19 11:41:45.771563	player	\N
15	active	2026-02-19 11:52:45.807368	2026-02-19 11:52:45.807368	player	\N
16	active	2026-02-19 12:08:22.382127	2026-02-19 12:08:22.382127	player	\N
17	active	2026-02-20 15:04:49.616823	2026-02-20 15:04:49.616823	player	\N
18	active	2026-02-20 18:13:16.999115	2026-02-20 18:13:16.999115	player	\N
19	active	2026-02-20 21:29:12.664852	2026-02-20 21:29:12.664852	player	\N
21	pending	2026-02-21 03:27:30.698804	2026-02-21 03:27:30.698804	player	\N
22	pending	2026-02-21 03:40:17.026367	2026-02-21 03:40:17.026367	player	\N
23	pending	2026-02-21 04:03:12.413341	2026-02-21 04:03:12.413341	player	\N
24	active	2026-02-21 09:54:46.845381	2026-02-21 09:54:46.845381	player	97
25	active	2026-02-21 09:57:17.654109	2026-02-21 09:57:17.654109	player	98
26	active	2026-02-21 10:01:40.841343	2026-02-21 10:01:40.841343	player	99
27	active	2026-02-21 10:05:11.944532	2026-02-21 10:05:11.944532	player	100
\.


--
-- Data for Name: team_member_team_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.team_member_team_subscriptions (id, team_member_id, team_id, created_by_staff_id, approved_by_staff_id, announcement_id, status, decline_reason, cancellation_reason, start_date, end_date, approved_at, declined_at, cancelled_at, monthly_fee, registration_fee, discount_amount, custom_price, payment_status, approval_notes, special_notes, is_captain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: team_member_teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.team_member_teams (id, team_name, created_at, start_date, end_date, status, price, team_member_id) FROM stdin;
109	Swim	2026-02-24 22:35:45.068612	2026-02-24	2027-02-24	active	1230.00	33
111	Scorore	2026-02-24 22:37:31.918581	\N	\N	active	0.00	35
113	Gymnastics	2026-02-24 22:47:42.290251	2026-02-25	2027-02-25	active	2000.00	36
115	Swim	2026-02-24 23:06:06.449555	2026-02-24	2027-02-24	active	1230.00	36
105	Scorore	2026-02-23 09:48:29.397326	2026-02-23	2027-02-23	pending	3000.00	33
106	Basketball	2026-02-23 09:48:29.397326	2026-02-23	2027-02-23	pending	60.00	33
107	FootBall	2026-02-24 14:12:00.837499	2026-02-24	2027-02-24	pending	12345.00	34
59	Scorore	2026-02-21 10:24:47.985021	2026-02-21	2027-02-21	pending	3000.00	12
60	FootBall	2026-02-21 10:33:13.149349	2026-02-21	2027-02-21	pending	12345.00	13
61	Swimmm	2026-02-21 10:33:13.149349	2026-02-21	2027-02-21	pending	12345.00	13
62	Swim	2026-02-21 11:29:37.988311	2026-02-21	2027-02-21	pending	1230.00	17
63	Basketball	2026-02-21 11:29:37.988311	2026-02-21	2027-02-21	pending	60.00	17
64	Scorore	2026-02-21 11:29:37.988311	2026-02-21	2027-02-21	pending	3000.00	17
65	Swimmm	2026-02-21 11:58:57.824248	2026-02-21	2027-02-21	pending	12345.00	18
66	FootBall	2026-02-21 11:58:57.824248	2026-02-21	2027-02-21	pending	12345.00	18
67	Scorore	2026-02-21 12:19:19.292592	2026-02-21	2027-02-21	pending	3000.00	19
68	Swim	2026-02-21 12:19:19.292592	2026-02-21	2027-02-21	pending	1230.00	19
69	Swimmm	2026-02-21 12:19:19.292592	2026-02-21	2027-02-21	pending	12345.00	19
70	سلة	2026-02-21 12:21:04.437311	2026-02-21	2027-02-21	pending	60.00	19
71	Gymnastics	2026-02-21 14:40:28.536469	2026-02-21	2027-02-21	pending	2000.00	21
72	Swim	2026-02-21 14:41:50.50655	2026-02-21	2027-02-21	pending	1230.00	21
73	Basketball	2026-02-21 22:34:33.686189	2026-02-22	2027-02-22	pending	60.00	22
74	FootBall	2026-02-21 22:34:33.686189	2026-02-22	2027-02-22	pending	12345.00	22
75	FootBall	2026-02-21 23:49:17.458254	2026-02-22	2027-02-22	pending	12345.00	23
76	Basketball	2026-02-21 23:57:13.775677	2026-02-22	2027-02-22	pending	60.00	24
77	FootBall	2026-02-21 23:57:13.775677	2026-02-22	2027-02-22	pending	12345.00	24
78	Scorore	2026-02-22 00:18:13.019844	2026-02-22	2027-02-22	pending	3000.00	25
79	Swim	2026-02-22 00:18:13.019844	2026-02-22	2027-02-22	pending	1230.00	25
80	Gymnastics	2026-02-22 20:03:49.739855	2026-02-22	2027-02-22	pending	2000.00	26
81	Scorore	2026-02-22 20:03:49.739855	2026-02-22	2027-02-22	pending	3000.00	26
82	Swim	2026-02-22 20:03:49.739855	2026-02-22	2027-02-22	pending	1230.00	26
83	Swimmm	2026-02-22 20:03:49.739855	2026-02-22	2027-02-22	pending	12345.00	26
88	Swimmm	2026-02-23 06:43:10.573404	\N	\N	pending	0.00	27
89	Basketball	2026-02-23 06:43:10.573404	\N	\N	pending	0.00	27
90	Scorore	2026-02-23 06:43:10.573404	\N	\N	pending	0.00	27
91	Swim	2026-02-23 06:43:10.573404	\N	\N	pending	0.00	27
92	Gymnastics	2026-02-23 06:43:10.573404	\N	\N	pending	0.00	27
93	Basketball	2026-02-23 08:15:03.975752	2026-02-23	2027-02-23	pending	60.00	28
94	FootBall	2026-02-23 08:15:03.975752	2026-02-23	2027-02-23	pending	12345.00	28
95	Scorore	2026-02-23 08:39:56.712656	2026-02-23	2027-02-23	pending	3000.00	29
96	FootBall	2026-02-23 08:39:56.712656	2026-02-23	2027-02-23	pending	12345.00	29
97	Basketball	2026-02-23 08:39:56.712656	2026-02-23	2027-02-23	pending	60.00	29
98	Swim	2026-02-23 09:03:49.065531	2026-02-23	2027-02-23	pending	1230.00	30
99	Basketball	2026-02-23 09:03:49.065531	2026-02-23	2027-02-23	pending	60.00	30
100	FootBall	2026-02-23 09:03:49.065531	2026-02-23	2027-02-23	pending	12345.00	30
101	Basketball	2026-02-23 09:29:45.619936	2026-02-23	2027-02-23	pending	60.00	31
102	FootBall	2026-02-23 09:29:45.619936	2026-02-23	2027-02-23	pending	12345.00	31
103	Scorore	2026-02-23 09:42:41.114277	2026-02-23	2027-02-23	pending	3000.00	32
104	Gymnastics	2026-02-23 09:42:41.114277	2026-02-23	2027-02-23	pending	2000.00	32
112	كرة سلة	2026-02-24 22:40:01.784074	2026-02-24	2027-02-24	active	60.00	33
114	كوره اجنبيه	2026-02-24 22:56:40.982728	2026-02-24	2027-02-24	active	3000.00	36
116	Football	2026-02-24 23:07:58.042494	2026-02-24	2027-02-24	active	12345.00	36
\.


--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.team_members (id, account_id, first_name_en, first_name_ar, last_name_en, last_name_ar, gender, phone, nationality, birthdate, national_id, address, photo, medical_report, is_foreign, status, created_at, updated_at, national_id_front, national_id_back, proof) FROM stdin;
1	139	Omar	عمر	Marmoush	مرموش	male	01022345678	Egyptian	2000-02-22	33221166998855	\N	\N	\N	f	pending	2026-02-21 02:07:50.729311	2026-02-21 02:07:50.729311	\N	\N	\N
2	141	Mohamed	محمد	Salah	صلاح	male	01022345678	Egyptian	2000-07-01	88554466997711	\N	uploads\\personal_photo-1771643743536-376398247.png	uploads\\medical_report-1771643743777-840078474.png	f	pending	2026-02-21 03:15:42.726567	2026-02-21 03:15:44.459012	\N	\N	\N
3	142	Farida	فريدة	Sherif	شريف	female	01022345678	Egyptian	1999-09-09	77441199663322	\N	uploads\\personal_photo-1771644449555-889555093.png	uploads\\medical_report-1771644449593-632838277.png	f	pending	2026-02-21 03:27:29.030897	2026-02-21 03:27:30.237478	\N	\N	\N
4	143	Younis	يونس	Ahmed	احمد	male	01022345678	Egyptian	2008-08-08	44661133997700	\N	uploads\\personal_photo-1771645215971-683890331.png	uploads\\medical_report-1771645216008-448886003.png	f	pending	2026-02-21 03:40:15.493954	2026-02-21 03:40:16.559877	\N	\N	\N
6	145	Ahmed	أحمد	Ali	علي	M	+201000000000	Egyptian	1995-05-15	12345678901234	Cairo, Egypt	\N	\N	f	pending	2026-02-21 04:55:39.203132	2026-02-21 04:55:39.203132	\N	\N	\N
7	146	Ahmed	أحمد	Ali	علي	M	+201000000000	Egyptian	1995-05-15	12345678971234	Cairo, Egypt	\N	\N	f	pending	2026-02-21 04:56:29.633817	2026-02-21 04:56:29.633817	\N	\N	\N
8	147	Hi	ll	Bestie	ll	\N	\N	\N	\N	12312312312312	\N	uploads\\photo-1771651366372-449662826.png	uploads\\medical_report-1771651366563-10411709.png	f	pending	2026-02-21 05:22:48.036396	2026-02-21 05:22:48.036396	\N	\N	\N
9	153	Ahmed	احمد	Mohammed	محمد	male	01500000000	Egyptian	2025-01-01	11112222333344	\N	uploads\\personal_photo-1771668768799-359656621.png	uploads\\medical_report-1771668768800-244971011.png	f	pending	2026-02-21 10:12:50.07269	2026-02-21 10:12:51.033453	\N	\N	\N
10	154	Ahmed	احمد	Mohammed	محمد	male	01500000000	Egyptian	2025-01-01	11112222333345	\N	uploads\\personal_photo-1771668821343-657549058.png	uploads\\medical_report-1771668821344-107747352.png	f	pending	2026-02-21 10:13:42.663661	2026-02-21 10:13:43.585149	\N	\N	\N
11	155	Ahmed	احمد	Mohammed	محمد	male	01500000000	Egyptian	2025-01-01	11112222333355	\N	uploads\\personal_photo-1771669072070-246530723.png	uploads\\medical_report-1771669072071-522831046.png	f	pending	2026-02-21 10:17:53.384388	2026-02-21 10:17:54.282135	\N	\N	\N
12	156	Ahmed	احمد	Mohammed	محمد	male	01500000000	Egyptian	2025-01-01	11112222333356	\N	uploads\\personal_photo-1771669485073-943169274.png	uploads\\medical_report-1771669485075-284802539.png	f	pending	2026-02-21 10:24:46.402139	2026-02-21 10:24:47.236186	\N	\N	\N
13	157	Mohammed	محمد	Ahmed	احمد	male	01500000000	Egyptian	2026-02-01	99988877766655	\N	uploads\\personal_photo-1771669989725-756411268.png	uploads\\medical_report-1771669989726-113165642.png	f	pending	2026-02-21 10:33:11.05628	2026-02-21 10:33:12.025754	\N	\N	\N
14	158	Zeyad	زياد	Zed	زد	male	01557000000	Egyptian	2026-02-01	99988877766633	\N	\N	\N	f	pending	2026-02-21 11:24:55.411996	2026-02-21 11:24:55.411996	\N	\N	\N
15	159	Zeyad	زياد	Zed	زد	male	01557000000	Egyptian	2026-02-01	99988877766622	\N	\N	\N	f	pending	2026-02-21 11:26:26.697848	2026-02-21 11:26:26.697848	\N	\N	\N
21	167	Rahma	رحمة	Tarek	طارق	female	01022345678	Egyptian	2003-04-28	99663388552200	\N	uploads\\personal_photo-1771684827273-128366727.png	uploads\\medical_report-1771684827326-277681502.png	f	pending	2026-02-21 14:40:27.129785	2026-02-21 14:40:27.998767	\N	\N	\N
16	160	Zeyad	زياد	Zed	زد	male	01557000000	Egyptian	2026-02-01	99988877766621	\N	uploads\\personal_photo-1771673327542-153039378.webp	uploads\\medical_report-1771673327543-54058634.webp	f	active	2026-02-21 11:28:49.104494	2026-02-21 12:24:41.633871	\N	\N	\N
17	161	Zeyad	زياد	Zed	زد	male	01557000000	Egyptian	2026-02-01	99988877766611	\N	uploads\\personal_photo-1771673375200-352439943.webp	uploads\\medical_report-1771673375200-15669889.webp	f	active	2026-02-21 11:29:36.844017	2026-02-21 11:53:00.170327	\N	\N	\N
18	162	Omar	عمر	Khyrat	خيرت	male	01151031404	Egyptian	2026-02-01	88997766554433	\N	uploads\\personal_photo-1771675134983-858710377.webp	uploads\\medical_report-1771675134984-464902467.webp	f	active	2026-02-21 11:58:56.676573	2026-02-21 12:15:19.510875	\N	\N	\N
19	163	Ahmed	احمد	Mohammed	محمد عمر	male	01500000000	Egyptian	2026-02-01	12121212121212	\N	uploads\\personal_photo-1771676356252-69188455.webp	uploads\\medical_report-1771676356253-886186641.webp	f	active	2026-02-21 12:19:17.763856	2026-02-21 12:19:57.625219	\N	\N	\N
20	164	Test 111	تيست 1	test 2	تيست 2	male	01010010101	Egyptian	2026-02-04	44111444444444	\N	uploads\\personal_photo-1771678516369-39085304.png	uploads\\medical_report-1771678516370-284775309.png	f	pending	2026-02-21 12:55:16.284489	2026-02-21 12:55:17.163006	\N	\N	\N
5	144	Yara	يارا	Ahmed	احمد	female	01022345678	Egyptian	2008-08-08	44661133997711	\N	uploads\\personal_photo-1771646590982-147663668.png	uploads\\medical_report-1771646591012-871536014.png	f	active	2026-02-21 04:03:10.299737	2026-02-21 04:03:11.956259	\N	\N	\N
22	201	Mohammed	محمد	Ahmed	احمد	male	01577777777	Egyptian	2026-02-01	11223344556677	\N	uploads\\personal_photo-1771713272672-161387829.jpg	uploads\\medical_report-1771713272672-215933909.webp	f	active	2026-02-21 22:34:31.647209	2026-02-21 22:36:01.558442	\N	\N	\N
23	213	Kerolos	sporte	ddvd	1	male	01235555555	Egyptian	2019-01-29	78954636988877	\N	uploads\\personal_photo-1771717748437-298687772.jpg	uploads\\medical_report-1771717748445-250279717.jpg	f	active	2026-02-21 23:49:15.885345	2026-02-21 23:51:10.323364	\N	\N	\N
38	254	OO	خخ	OO	خخ	male	01235658955	Egyptian	2002-02-02	36438589710568	\N	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772393910/helwan-club/members/photos/helwan-club/members/photos/61c93afd41ffcc9b6ece0f07d4248036-1772393909002.jpg	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772393912/helwan-club/members/medical-reports/helwan-club/members/medical-reports/61c93afd41ffcc9b6ece0f07d4248036-1772393911009.jpg	f	pending	2026-03-01 19:38:29.433535	2026-03-01 19:38:37.025824	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772393913/helwan-club/members/national-ids/helwan-club/members/national-ids/61c93afd41ffcc9b6ece0f07d4248036-1772393912223.jpg	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772393914/helwan-club/members/national-ids/helwan-club/members/national-ids/61c93afd41ffcc9b6ece0f07d4248036-1772393913367.jpg	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772393915/helwan-club/members/proofs/helwan-club/members/proofs/61c93afd41ffcc9b6ece0f07d4248036-1772393914188.jpg
29	226	Mohammed	محمد	aaaaaa	ععععع	male	01111111111	Egyptian	2026-02-01	21334455667788	\N	uploads\\personal_photo-1771835994518-554017954.png	uploads\\medical_report-1771835994518-782112428.png	f	active	2026-02-23 08:39:55.439399	2026-02-23 08:41:00.783503	\N	\N	uploads\\proof-1771835994529-782442278.png
24	214	Ahmed	احمد احمد	Ahmed	احمد	male	01170000001	Egyptian	2025-12-01	22334455667789	\N	uploads\\personal_photo-1771719321446-245761738.png	uploads\\medical_report-1771718232751-276863451.png	f	active	2026-02-21 23:57:12.649644	2026-02-22 00:15:22.647574	\N	\N	\N
35	240	zeyad	كيرلس	alaa	ماجدد	male	01233333331	Egyptian	2000-02-02	99032423235898	\N	uploads\\personal_photo-1771948953703-297080374.jpg	uploads\\medical_report-1771948953721-569591753.jpg	f	active	2026-02-24 16:02:34.36588	2026-02-24 16:42:18.322473	uploads\\national_id_front-1771948953730-194370380.jpg	uploads\\national_id_back-1771948953739-449524501.jpg	uploads\\proof-1771948953753-110910937.jpg
30	227	Mt	مت	aaaaaaa	ععععع	male	01500000000	Egyptian	2025-11-01	32114455667788	\N	uploads\\personal_photo-1771837427006-449614009.jpg	uploads\\medical_report-1771837427007-154872945.png	f	active	2026-02-23 09:03:47.788561	2026-02-23 09:06:28.945657	\N	\N	uploads\\proof-1771837427010-355303056.jpg
27	221	Staff player	لاعب ستاففففف	Staffffplayer	لاعب ستاف	male	01026165849	Egyptian	2026-02-04	13131313132412	\N	uploads\\personal_photo-1771791200146-760086986.png	uploads\\medical_report-1771791200158-93722651.png	f	pending	2026-02-22 20:13:19.149199	2026-02-23 03:39:31.787455	uploads\\national_id_front-1771791200158-268170663.png	uploads\\national_id_back-1771791200158-87044390.png	uploads\\proof-1771791200158-938550429.png
26	219	Staff	اكونت سبورتس	Team member	اكونت رياضه من الستا	male	01011118987	Egyptian	2026-02-04	12121212344444	\N	uploads\\personal_photo-1771790627435-767742146.png	uploads\\medical_report-1771790627436-207312237.png	f	pending	2026-02-22 20:03:45.921201	2026-02-23 03:47:35.615127	uploads\\national_id_front-1771790627436-829795021.png	uploads\\national_id_back-1771790627436-569277816.png	uploads\\proof-1771790627436-72555106.png
25	215	Mohammed	محمد محمد	Omar	عمر	male	01155555555	Egyptian	2026-01-01	44556677889911	\N	uploads\\personal_photo-1771719491470-968513421.png	uploads\\medical_report-1771719491470-359240987.png	f	active	2026-02-22 00:18:11.307248	2026-02-23 03:48:11.158278	\N	\N	\N
31	228	mt	مت	mt	مت	male	01500000000	Egyptian	2026-02-23	33221111445566	\N	uploads\\personal_photo-1771838983387-218476298.jpg	uploads\\medical_report-1771838983388-607876705.png	f	active	2026-02-23 09:29:44.390888	2026-02-23 09:39:52.221762	uploads\\national_id_front-1771839589917-432551000.png	uploads\\national_id_back-1771839589916-711226150.png	uploads\\proof-1771838983391-141013209.jpg
28	225	Ahmed	احمد	AAAAA	ععععع	male	01500000000	Egyptian	2026-02-01	12334455667788	\N	uploads\\personal_photo-1771834501837-89984212.png	uploads\\medical_report-1771834501840-840092538.png	f	active	2026-02-23 08:15:02.649725	2026-02-23 08:37:29.320903	uploads\\national_id_front-1771835847304-840824634.png	uploads\\national_id_back-1771835847303-168679978.png	uploads\\proof-1771834501842-555122650.png
34	237	kerolos	kiro	kamal	كمال	male	00000000000	Egyptian	2000-03-02	12222222222222	\N	uploads\\personal_photo-1771943124738-411856077.jpg	uploads\\medical_report-1771942318127-853079291.jpg	f	active	2026-02-24 14:11:58.740253	2026-02-24 14:42:00.017363	uploads\\national_id_front-1771942318133-833021325.jpg	uploads\\national_id_back-1771942318140-895570387.jpg	uploads\\proof-1771942318158-635733315.jpg
32	229	Ahmed	ءؤئءؤ	Mohammed	ئءئءئء	male	01200000000	Egyptian	2026-02-01	55441122334545	\N	uploads\\personal_photo-1771839758884-498023588.jpg	uploads\\medical_report-1771839758884-817318172.png	f	active	2026-02-23 09:42:39.943693	2026-02-23 09:43:39.911554	uploads\\national_id_front-1771839758885-632735141.png	uploads\\national_id_back-1771839758885-535528538.png	uploads\\proof-1771839758889-631699507.png
33	230	Aaaa	ععععع	Aaaa	ععععع	male	01233333333	Egyptian	2026-02-02	98988776655443	\N	uploads\\personal_photo-1771840107139-418682912.jpg	uploads\\medical_report-1771840107140-138808902.png	f	active	2026-02-23 09:48:28.197008	2026-02-23 09:49:12.679779	uploads\\national_id_front-1771840107140-92381641.png	uploads\\national_id_back-1771840107141-624327144.png	uploads\\proof-1771840107163-766237533.png
36	243	zz	ئئ	zz	ئئ	male	01230000000	Egyptian	2000-01-02	98987766545321	\N	uploads\\personal_photo-1771973260093-806094009.jpeg	uploads\\medical_report-1771973260104-532818990.jpeg	f	active	2026-02-24 22:47:41.00066	2026-02-24 22:48:29.093012	uploads\\national_id_front-1771973260104-424031635.jpeg	uploads\\national_id_back-1771973260106-357244223.jpeg	uploads\\proof-1771973260107-317005801.jpeg
37	253	qq	ضض	qq	ضض	male	01230000000	Egyptian	2000-02-20	98658957286296	\N	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772393064/helwan-club/members/photos/helwan-club/members/photos/61c93afd41ffcc9b6ece0f07d4248036-1772393062074.jpg	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772393065/helwan-club/members/medical-reports/helwan-club/members/medical-reports/61c93afd41ffcc9b6ece0f07d4248036-1772393063968.jpg	f	pending	2026-03-01 19:24:22.418927	2026-03-01 19:24:29.42042	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772393066/helwan-club/members/national-ids/helwan-club/members/national-ids/61c93afd41ffcc9b6ece0f07d4248036-1772393064860.jpg	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772393067/helwan-club/members/national-ids/helwan-club/members/national-ids/61c93afd41ffcc9b6ece0f07d4248036-1772393066127.jpg	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772393068/helwan-club/members/proofs/helwan-club/members/proofs/61c93afd41ffcc9b6ece0f07d4248036-1772393067093.jpg
39	256	kk	نن	kk	نن	male	01132489587	Egyptian	2001-02-12	56998124125878	\N	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772395294/helwan-club/members/photos/helwan-club/members/photos/61c93afd41ffcc9b6ece0f07d4248036-1772395292819.jpg	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772395295/helwan-club/members/medical-reports/helwan-club/members/medical-reports/61c93afd41ffcc9b6ece0f07d4248036-1772395294687.jpg	f	active	2026-03-01 20:01:33.324408	2026-03-01 21:14:07.207778	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772395298/helwan-club/members/national-ids/helwan-club/members/national-ids/61c93afd41ffcc9b6ece0f07d4248036-1772395297060.jpg	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772395299/helwan-club/members/national-ids/helwan-club/members/national-ids/61c93afd41ffcc9b6ece0f07d4248036-1772395298233.jpg	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772395300/helwan-club/members/proofs/helwan-club/members/proofs/61c93afd41ffcc9b6ece0f07d4248036-1772395299316.jpg
\.


--
-- Data for Name: university_student_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.university_student_details (id, member_id, faculty_id, graduation_year, enrollment_date, created_at, updated_at, student_proof) FROM stdin;
2	14	1	2014	2026-01-27	2026-01-27 01:23:56.627968	2026-01-27 01:23:56.627968	\N
3	19	1	2004	2026-01-30	2026-01-30 17:09:39.79586	2026-01-30 17:09:39.79586	\N
4	22	10	2004	2026-01-30	2026-01-30 18:45:07.273957	2026-01-30 18:45:07.273957	\N
5	24	4	2004	2026-01-31	2026-01-31 20:42:02.491028	2026-01-31 20:42:02.491028	\N
6	25	1	2222	2026-02-01	2026-02-01 02:09:56.145784	2026-02-01 02:09:56.145784	\N
7	39	1	2027	2026-02-14	2026-02-14 12:59:03.659038	2026-02-14 12:59:03.659038	\N
8	40	1	2027	2026-02-14	2026-02-14 13:00:12.118173	2026-02-14 13:00:12.118173	\N
9	41	1	2027	2026-02-14	2026-02-14 13:06:57.304729	2026-02-14 13:06:57.304729	\N
10	42	1	2027	2026-02-14	2026-02-14 13:17:24.729513	2026-02-14 13:17:24.729513	\N
11	43	1	2026	2026-02-14	2026-02-14 13:22:08.507037	2026-02-14 13:22:08.507037	\N
12	44	1	2026	2026-02-14	2026-02-14 13:24:56.768001	2026-02-14 13:24:56.768001	\N
13	63	10	2026	2026-02-17	2026-02-17 20:20:08.809833	2026-02-17 20:20:08.809833	\N
14	102	10	2026	2026-02-21	2026-02-21 15:40:11.65461	2026-02-21 15:40:11.65461	\N
16	106	13	2026	2026-02-21	2026-02-21 18:23:38.466181	2026-02-21 18:23:38.466181	\N
17	112	11	2026	2026-02-21	2026-02-21 19:35:29.139935	2026-02-21 19:35:29.139935	\N
18	113	14	2030	2026-02-21	2026-02-21 19:53:15.947146	2026-02-21 19:53:15.947146	\N
19	124	9	2026	2026-02-21	2026-02-21 20:56:02.234589	2026-02-21 20:56:02.234589	\N
21	128	13	2022	2026-02-21	2026-02-21 21:04:48.066931	2026-02-21 21:04:48.066931	\N
22	130	1	2022	2026-02-21	2026-02-21 21:16:28.073817	2026-02-21 21:16:28.073817	\N
23	137	15	2020	2026-02-22	2026-02-21 22:43:50.318548	2026-02-21 22:43:50.318548	\N
24	155	11	2028	2026-02-24	2026-02-24 14:46:49.241909	2026-02-24 14:46:49.241909	uploads\\student_proof-1771944408075-545576961.jpg
25	156	9	2026	2026-02-24	2026-02-24 18:42:07.478147	2026-02-24 18:42:07.478147	uploads\\student_proof-1771958649143-4474859.jpg
26	161	11	2026	2026-03-01	2026-03-01 03:02:02.623226	2026-03-01 03:02:02.623226	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772334120/helwan-club/members/proofs/helwan-club/members/proofs/Gemini_Generated_Image_mvq49kmvq49kmvq4-1772334222204.jpg
27	163	11	2026	2026-03-01	2026-03-01 12:00:06.263785	2026-03-01 12:00:06.263785	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772366404/helwan-club/members/proofs/helwan-club/members/proofs/WhatsApp%20Image%202026-03-01%20at%201.55.55%20PM-1772366529084.jpg
28	164	9	2020	2026-03-01	2026-03-01 18:04:38.652696	2026-03-01 18:04:38.652696	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772388276/helwan-club/members/proofs/helwan-club/members/proofs/Gemini_Generated_Image_mvq49kmvq49kmvq4-1772388394246.jpg
29	165	6	2026	2026-03-01	2026-03-01 18:43:23.284557	2026-03-01 18:43:23.284557	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772390601/helwan-club/members/proofs/helwan-club/members/proofs/Gemini_Generated_Image_mvq49kmvq49kmvq4-1772390718817.jpg
30	166	11	2026	2026-03-01	2026-03-01 19:50:54.569894	2026-03-01 19:50:54.569894	https://res.cloudinary.com/dkjnugbsd/image/upload/v1772394652/helwan-club/members/proofs/helwan-club/members/proofs/61c93afd41ffcc9b6ece0f07d4248036-1772394650942.jpg
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2026-01-24 13:10:15
20211116045059	2026-01-24 13:10:15
20211116050929	2026-01-24 13:10:15
20211116051442	2026-01-24 13:10:15
20211116212300	2026-01-24 13:10:15
20211116213355	2026-01-24 13:10:15
20211116213934	2026-01-24 13:10:15
20211116214523	2026-01-24 13:10:16
20211122062447	2026-01-24 13:10:16
20211124070109	2026-01-24 13:10:16
20211202204204	2026-01-24 13:10:16
20211202204605	2026-01-24 13:10:16
20211210212804	2026-01-24 13:10:17
20211228014915	2026-01-24 13:10:17
20220107221237	2026-01-24 13:10:17
20220228202821	2026-01-24 13:10:17
20220312004840	2026-01-24 13:10:17
20220603231003	2026-01-24 13:10:17
20220603232444	2026-01-24 13:10:17
20220615214548	2026-01-24 13:10:18
20220712093339	2026-01-24 13:10:18
20220908172859	2026-01-24 13:10:18
20220916233421	2026-01-24 13:10:18
20230119133233	2026-01-24 13:10:18
20230128025114	2026-01-24 13:10:18
20230128025212	2026-01-24 13:10:18
20230227211149	2026-01-24 13:10:19
20230228184745	2026-01-24 13:10:19
20230308225145	2026-01-24 13:10:19
20230328144023	2026-01-24 13:10:19
20231018144023	2026-01-24 13:10:19
20231204144023	2026-01-24 13:10:19
20231204144024	2026-01-24 13:10:19
20231204144025	2026-01-24 13:10:20
20240108234812	2026-01-24 13:10:20
20240109165339	2026-01-24 13:10:20
20240227174441	2026-01-24 13:10:20
20240311171622	2026-01-24 13:10:20
20240321100241	2026-01-24 13:10:20
20240401105812	2026-01-24 13:10:21
20240418121054	2026-01-24 13:10:21
20240523004032	2026-01-24 13:10:21
20240618124746	2026-01-24 13:10:22
20240801235015	2026-01-24 13:10:22
20240805133720	2026-01-24 13:10:22
20240827160934	2026-01-24 13:10:22
20240919163303	2026-01-24 13:10:22
20240919163305	2026-01-24 13:10:22
20241019105805	2026-01-24 13:10:22
20241030150047	2026-01-24 13:10:23
20241108114728	2026-01-24 13:10:23
20241121104152	2026-01-24 13:10:23
20241130184212	2026-01-24 13:10:23
20241220035512	2026-01-24 13:10:23
20241220123912	2026-01-24 13:10:24
20241224161212	2026-01-24 13:10:24
20250107150512	2026-01-24 13:10:24
20250110162412	2026-01-24 13:10:24
20250123174212	2026-01-24 13:10:24
20250128220012	2026-01-24 13:10:24
20250506224012	2026-01-24 13:10:24
20250523164012	2026-01-24 13:10:24
20250714121412	2026-01-24 13:10:25
20250905041441	2026-01-24 13:10:25
20251103001201	2026-01-24 13:10:25
20251120212548	2026-02-03 22:24:51
20251120215549	2026-02-03 22:24:52
20260218120000	2026-02-28 18:17:31
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at, action_filter) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2026-01-24 13:10:03.376691
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2026-01-24 13:10:03.707063
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2026-01-24 13:10:03.858105
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2026-01-24 13:10:03.941587
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2026-01-24 13:10:03.972127
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2026-01-24 13:10:04.007515
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2026-01-24 13:10:04.028958
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2026-01-24 13:10:04.074082
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2026-01-24 13:10:04.101152
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2026-01-24 13:10:04.121894
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2026-01-24 13:10:04.152002
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2026-01-24 13:10:04.190942
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2026-01-24 13:10:04.210033
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2026-01-24 13:10:04.227525
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2026-01-24 13:10:04.234587
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2026-01-24 13:10:04.241134
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2026-01-24 13:10:04.246829
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2026-01-24 13:10:04.254891
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2026-01-24 13:10:04.269582
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2026-01-24 13:10:04.283791
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2026-01-24 13:10:04.289436
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2026-01-24 13:10:04.296507
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2026-01-24 13:10:04.83945
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2026-01-24 13:10:04.921029
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2026-01-24 13:10:04.949715
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2026-01-24 13:10:04.974198
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2026-01-24 13:10:04.981914
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2026-01-24 13:10:05.099503
2	storage-schema	f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd	2026-01-24 13:10:03.778426
6	change-column-name-in-get-size	ded78e2f1b5d7e616117897e6443a925965b30d2	2026-01-24 13:10:03.984155
9	fix-search-function	af597a1b590c70519b464a4ab3be54490712796b	2026-01-24 13:10:04.040356
10	search-files-search-function	b595f05e92f7e91211af1bbfe9c6a13bb3391e16	2026-01-24 13:10:04.063531
26	objects-prefixes	215cabcb7f78121892a5a2037a09fedf9a1ae322	2026-01-24 13:10:04.309297
27	search-v2	859ba38092ac96eb3964d83bf53ccc0b141663a6	2026-01-24 13:10:04.35397
28	object-bucket-name-sorting	c73a2b5b5d4041e39705814fd3a1b95502d38ce4	2026-01-24 13:10:04.77193
29	create-prefixes	ad2c1207f76703d11a9f9007f821620017a66c21	2026-01-24 13:10:04.78205
30	update-object-levels	2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6	2026-01-24 13:10:04.790207
31	objects-level-index	b40367c14c3440ec75f19bbce2d71e914ddd3da0	2026-01-24 13:10:04.797243
32	backward-compatible-index-on-objects	e0c37182b0f7aee3efd823298fb3c76f1042c0f7	2026-01-24 13:10:04.804431
33	backward-compatible-index-on-prefixes	b480e99ed951e0900f033ec4eb34b5bdcb4e3d49	2026-01-24 13:10:04.812606
34	optimize-search-function-v1	ca80a3dc7bfef894df17108785ce29a7fc8ee456	2026-01-24 13:10:04.815431
35	add-insert-trigger-prefixes	458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc	2026-01-24 13:10:04.823355
36	optimise-existing-functions	6ae5fca6af5c55abe95369cd4f93985d1814ca8f	2026-01-24 13:10:04.829789
38	iceberg-catalog-flag-on-buckets	02716b81ceec9705aed84aa1501657095b32e5c5	2026-01-24 13:10:04.845178
39	add-search-v2-sort-support	6706c5f2928846abee18461279799ad12b279b78	2026-01-24 13:10:04.864375
40	fix-prefix-race-conditions-optimized	7ad69982ae2d372b21f48fc4829ae9752c518f6b	2026-01-24 13:10:04.870338
41	add-object-level-update-trigger	07fcf1a22165849b7a029deed059ffcde08d1ae0	2026-01-24 13:10:04.880375
42	rollback-prefix-triggers	771479077764adc09e2ea2043eb627503c034cd4	2026-01-24 13:10:04.888193
43	fix-object-level	84b35d6caca9d937478ad8a797491f38b8c2979f	2026-01-24 13:10:04.908229
48	iceberg-catalog-ids	e0e8b460c609b9999ccd0df9ad14294613eed939	2026-01-24 13:10:05.052765
50	search-v2-optimised	6323ac4f850aa14e7387eb32102869578b5bd478	2026-02-13 20:44:00.320837
51	index-backward-compatible-search	2ee395d433f76e38bcd3856debaf6e0e5b674011	2026-02-13 20:44:00.395602
52	drop-not-used-indexes-and-functions	5cc44c8696749ac11dd0dc37f2a3802075f3a171	2026-02-13 20:44:00.397895
53	drop-index-lower-name	d0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854	2026-02-13 20:44:00.534715
54	drop-index-object-level	6289e048b1472da17c31a7eba1ded625a6457e67	2026-02-13 20:44:00.537835
55	prevent-direct-deletes	262a4798d5e0f2e7c8970232e03ce8be695d5819	2026-02-13 20:44:00.540039
56	fix-optimized-search-function	cb58526ebc23048049fd5bf2fd148d18b04a2073	2026-02-13 20:44:00.549335
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 1, false);


--
-- Name: accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.accounts_id_seq', 256, true);


--
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 179, true);


--
-- Name: advertisement_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.advertisement_categories_id_seq', 10, true);


--
-- Name: advertisement_photos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.advertisement_photos_id_seq', 1, true);


--
-- Name: advertisements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.advertisements_id_seq', 2, true);


--
-- Name: announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.announcements_id_seq', 1, false);


--
-- Name: branch_sport_teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.branch_sport_teams_id_seq', 4, true);


--
-- Name: branches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.branches_id_seq', 1, false);


--
-- Name: employee_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employee_details_id_seq', 34, true);


--
-- Name: faculties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.faculties_id_seq', 22, true);


--
-- Name: media_posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.media_posts_id_seq', 8, true);


--
-- Name: member_memberships_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.member_memberships_id_seq', 131, true);


--
-- Name: member_relationships_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.member_relationships_id_seq', 2, true);


--
-- Name: member_team_subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.member_team_subscriptions_id_seq', 2, true);


--
-- Name: member_teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.member_teams_id_seq', 29, true);


--
-- Name: member_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.member_types_id_seq', 18, true);


--
-- Name: members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.members_id_seq', 166, true);


--
-- Name: membership_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.membership_plans_id_seq', 141, true);


--
-- Name: outsider_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.outsider_details_id_seq', 13, true);


--
-- Name: packages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.packages_id_seq', 10, true);


--
-- Name: privilege_packages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.privilege_packages_id_seq', 6, true);


--
-- Name: privileges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.privileges_id_seq', 149, true);


--
-- Name: professions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.professions_id_seq', 4, true);


--
-- Name: retired_employee_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.retired_employee_details_id_seq', 8, true);


--
-- Name: sport_branches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sport_branches_id_seq', 1, false);


--
-- Name: sports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sports_id_seq', 15, true);


--
-- Name: staff_action_approvals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.staff_action_approvals_id_seq', 1, true);


--
-- Name: staff_activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.staff_activity_logs_id_seq', 1, false);


--
-- Name: staff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.staff_id_seq', 44, true);


--
-- Name: staff_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.staff_types_id_seq', 25, true);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tasks_id_seq', 5, true);


--
-- Name: team_member_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.team_member_details_id_seq', 27, true);


--
-- Name: team_member_team_subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.team_member_team_subscriptions_id_seq', 1, false);


--
-- Name: team_member_teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.team_member_teams_id_seq', 116, true);


--
-- Name: team_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.team_members_id_seq', 39, true);


--
-- Name: university_student_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.university_student_details_id_seq', 30, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: custom_oauth_providers custom_oauth_providers_identifier_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_identifier_key UNIQUE (identifier);


--
-- Name: custom_oauth_providers custom_oauth_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: audit_logs PK_1bb179d048bbc581caa3b013439; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY (id);


--
-- Name: team_member_teams PK_1cbafa870658501e7381af2a1f8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_member_teams
    ADD CONSTRAINT "PK_1cbafa870658501e7381af2a1f8" PRIMARY KEY (id);


--
-- Name: sports PK_4fa1063d368e1fd68ea63c7d860; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sports
    ADD CONSTRAINT "PK_4fa1063d368e1fd68ea63c7d860" PRIMARY KEY (id);


--
-- Name: staff_activity_logs PK_69b7f3ac6197332591100e0401f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_activity_logs
    ADD CONSTRAINT "PK_69b7f3ac6197332591100e0401f" PRIMARY KEY (id);


--
-- Name: branches PK_7f37d3b42defea97f1df0d19535; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT "PK_7f37d3b42defea97f1df0d19535" PRIMARY KEY (id);


--
-- Name: tasks PK_8d12ff38fcc62aaba2cab748772; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY (id);


--
-- Name: team_member_details PK_d801d51cf290223169f2d44fa4b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_member_details
    ADD CONSTRAINT "PK_d801d51cf290223169f2d44fa4b" PRIMARY KEY (id);


--
-- Name: staff_package_privileges PK_f0d12355739c0b31ecbdeb84d6a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_package_privileges
    ADD CONSTRAINT "PK_f0d12355739c0b31ecbdeb84d6a" PRIMARY KEY (package_id, privilege_id);


--
-- Name: activity_logs PK_f25287b6140c5ba18d38776a796; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT "PK_f25287b6140c5ba18d38776a796" PRIMARY KEY (id);


--
-- Name: branches UQ_9c06cbb83feb2f0be6263bd47ee; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT "UQ_9c06cbb83feb2f0be6263bd47ee" UNIQUE (code);


--
-- Name: sport_branches UQ_e5b73b0c05ba7a8de5627e01f93; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sport_branches
    ADD CONSTRAINT "UQ_e5b73b0c05ba7a8de5627e01f93" UNIQUE (sport_id, branch_id);


--
-- Name: accounts accounts_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_key UNIQUE (email);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: advertisement_categories advertisement_categories_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advertisement_categories
    ADD CONSTRAINT advertisement_categories_code_key UNIQUE (code);


--
-- Name: advertisement_categories advertisement_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advertisement_categories
    ADD CONSTRAINT advertisement_categories_pkey PRIMARY KEY (id);


--
-- Name: advertisement_photos advertisement_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advertisement_photos
    ADD CONSTRAINT advertisement_photos_pkey PRIMARY KEY (id);


--
-- Name: advertisements advertisements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advertisements
    ADD CONSTRAINT advertisements_pkey PRIMARY KEY (id);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: booking_participants booking_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_participants
    ADD CONSTRAINT booking_participants_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_share_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_share_token_key UNIQUE (share_token);


--
-- Name: branch_sport_teams branch_sport_teams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branch_sport_teams
    ADD CONSTRAINT branch_sport_teams_pkey PRIMARY KEY (id);


--
-- Name: employee_details employee_details_member_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_details
    ADD CONSTRAINT employee_details_member_id_key UNIQUE (member_id);


--
-- Name: employee_details employee_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_details
    ADD CONSTRAINT employee_details_pkey PRIMARY KEY (id);


--
-- Name: faculties faculties_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculties
    ADD CONSTRAINT faculties_code_key UNIQUE (code);


--
-- Name: faculties faculties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculties
    ADD CONSTRAINT faculties_pkey PRIMARY KEY (id);


--
-- Name: field_operating_hours field_operating_hours_field_id_day_of_week_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.field_operating_hours
    ADD CONSTRAINT field_operating_hours_field_id_day_of_week_key UNIQUE (field_id, day_of_week);


--
-- Name: field_operating_hours field_operating_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.field_operating_hours
    ADD CONSTRAINT field_operating_hours_pkey PRIMARY KEY (id);


--
-- Name: fields fields_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fields
    ADD CONSTRAINT fields_pkey PRIMARY KEY (id);


--
-- Name: media_posts media_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_posts
    ADD CONSTRAINT media_posts_pkey PRIMARY KEY (id);


--
-- Name: member_memberships member_memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_memberships
    ADD CONSTRAINT member_memberships_pkey PRIMARY KEY (id);


--
-- Name: member_relationships member_relationships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_relationships
    ADD CONSTRAINT member_relationships_pkey PRIMARY KEY (id);


--
-- Name: member_team_subscriptions member_team_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_team_subscriptions
    ADD CONSTRAINT member_team_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: member_teams member_teams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_teams
    ADD CONSTRAINT member_teams_pkey PRIMARY KEY (id);


--
-- Name: member_types member_types_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_types
    ADD CONSTRAINT member_types_code_key UNIQUE (code);


--
-- Name: member_types member_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_types
    ADD CONSTRAINT member_types_pkey PRIMARY KEY (id);


--
-- Name: members members_account_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_account_id_key UNIQUE (account_id);


--
-- Name: members members_national_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_national_id_key UNIQUE (national_id);


--
-- Name: members members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (id);


--
-- Name: membership_plans membership_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membership_plans
    ADD CONSTRAINT membership_plans_pkey PRIMARY KEY (id);


--
-- Name: membership_plans membership_plans_plan_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membership_plans
    ADD CONSTRAINT membership_plans_plan_code_key UNIQUE (plan_code);


--
-- Name: outsider_details outsider_details_member_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.outsider_details
    ADD CONSTRAINT outsider_details_member_id_key UNIQUE (member_id);


--
-- Name: outsider_details outsider_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.outsider_details
    ADD CONSTRAINT outsider_details_pkey PRIMARY KEY (id);


--
-- Name: packages privilege_packages_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.packages
    ADD CONSTRAINT privilege_packages_code_key UNIQUE (code);


--
-- Name: packages privilege_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.packages
    ADD CONSTRAINT privilege_packages_pkey PRIMARY KEY (id);


--
-- Name: privileges privileges_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.privileges
    ADD CONSTRAINT privileges_code_key UNIQUE (code);


--
-- Name: privileges_packages privileges_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.privileges_packages
    ADD CONSTRAINT privileges_packages_pkey PRIMARY KEY (privilege_id, package_id);


--
-- Name: privileges privileges_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.privileges
    ADD CONSTRAINT privileges_pkey PRIMARY KEY (id);


--
-- Name: professions professions_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professions
    ADD CONSTRAINT professions_code_key UNIQUE (code);


--
-- Name: professions professions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professions
    ADD CONSTRAINT professions_pkey PRIMARY KEY (id);


--
-- Name: retired_employee_details retired_employee_details_member_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.retired_employee_details
    ADD CONSTRAINT retired_employee_details_member_id_key UNIQUE (member_id);


--
-- Name: retired_employee_details retired_employee_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.retired_employee_details
    ADD CONSTRAINT retired_employee_details_pkey PRIMARY KEY (id);


--
-- Name: sport_branches sport_branches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sport_branches
    ADD CONSTRAINT sport_branches_pkey PRIMARY KEY (id);


--
-- Name: staff staff_account_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_account_id_key UNIQUE (account_id);


--
-- Name: staff_action_approvals staff_action_approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_action_approvals
    ADD CONSTRAINT staff_action_approvals_pkey PRIMARY KEY (id);


--
-- Name: staff staff_national_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_national_id_key UNIQUE (national_id);


--
-- Name: staff_packages staff_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_packages
    ADD CONSTRAINT staff_packages_pkey PRIMARY KEY (staff_id, package_id);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- Name: staff_privileges_override staff_privileges_override_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_privileges_override
    ADD CONSTRAINT staff_privileges_override_pkey PRIMARY KEY (staff_id, privilege_id);


--
-- Name: staff_types staff_types_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_types
    ADD CONSTRAINT staff_types_code_key UNIQUE (code);


--
-- Name: staff_types staff_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_types
    ADD CONSTRAINT staff_types_pkey PRIMARY KEY (id);


--
-- Name: team_member_details team_member_details_member_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_member_details
    ADD CONSTRAINT team_member_details_member_id_key UNIQUE (team_member_id);


--
-- Name: team_member_team_subscriptions team_member_team_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_member_team_subscriptions
    ADD CONSTRAINT team_member_team_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_account_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_account_id_key UNIQUE (account_id);


--
-- Name: team_members team_members_national_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_national_id_key UNIQUE (national_id);


--
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- Name: university_student_details university_student_details_member_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.university_student_details
    ADD CONSTRAINT university_student_details_member_id_key UNIQUE (member_id);


--
-- Name: university_student_details university_student_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.university_student_details
    ADD CONSTRAINT university_student_details_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: custom_oauth_providers_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_created_at_idx ON auth.custom_oauth_providers USING btree (created_at);


--
-- Name: custom_oauth_providers_enabled_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_enabled_idx ON auth.custom_oauth_providers USING btree (enabled);


--
-- Name: custom_oauth_providers_identifier_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_identifier_idx ON auth.custom_oauth_providers USING btree (identifier);


--
-- Name: custom_oauth_providers_provider_type_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_provider_type_idx ON auth.custom_oauth_providers USING btree (provider_type);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: idx_account_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_account_email ON public.accounts USING btree (email);


--
-- Name: idx_activity_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activity_date ON public.activity_logs USING btree (action_date);


--
-- Name: idx_activity_member; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activity_member ON public.activity_logs USING btree (member_id);


--
-- Name: idx_announcement_branch_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_announcement_branch_id ON public.announcements USING btree (branch_id);


--
-- Name: idx_announcement_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_announcement_created_at ON public.announcements USING btree (created_at);


--
-- Name: idx_announcement_sport_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_announcement_sport_id ON public.announcements USING btree (sport_id);


--
-- Name: idx_announcement_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_announcement_status ON public.announcements USING btree (status);


--
-- Name: idx_booking_participants_booking; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_booking_participants_booking ON public.booking_participants USING btree (booking_id);


--
-- Name: idx_booking_participants_national_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_booking_participants_national_id ON public.booking_participants USING btree (national_id);


--
-- Name: idx_bookings_field_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_field_id ON public.bookings USING btree (field_id);


--
-- Name: idx_bookings_member_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_member_id ON public.bookings USING btree (member_id);


--
-- Name: idx_bookings_share_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_share_token ON public.bookings USING btree (share_token);


--
-- Name: idx_bookings_sport_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_sport_id ON public.bookings USING btree (sport_id);


--
-- Name: idx_bookings_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_status ON public.bookings USING btree (status);


--
-- Name: idx_bookings_team_member_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_team_member_id ON public.bookings USING btree (team_member_id);


--
-- Name: idx_branch_sport_team_branch_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_branch_sport_team_branch_id ON public.branch_sport_teams USING btree (branch_id);


--
-- Name: idx_branch_sport_team_composite; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_branch_sport_team_composite ON public.branch_sport_teams USING btree (branch_id, sport_id);


--
-- Name: idx_branch_sport_team_sport_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_branch_sport_team_sport_id ON public.branch_sport_teams USING btree (sport_id);


--
-- Name: idx_branch_sport_team_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_branch_sport_team_status ON public.branch_sport_teams USING btree (status);


--
-- Name: idx_employee_member; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employee_member ON public.employee_details USING btree (member_id);


--
-- Name: idx_employee_profession; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employee_profession ON public.employee_details USING btree (profession_id);


--
-- Name: idx_field_operating_hours_field; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_field_operating_hours_field ON public.field_operating_hours USING btree (field_id);


--
-- Name: idx_fields_branch_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fields_branch_id ON public.fields USING btree (branch_id);


--
-- Name: idx_fields_sport_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fields_sport_id ON public.fields USING btree (sport_id);


--
-- Name: idx_fields_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fields_status ON public.fields USING btree (status);


--
-- Name: idx_member_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_member_status ON public.members USING btree (status);


--
-- Name: idx_member_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_member_type ON public.members USING btree (member_type_id);


--
-- Name: idx_membership_end_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_membership_end_date ON public.member_memberships USING btree (end_date);


--
-- Name: idx_membership_member; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_membership_member ON public.member_memberships USING btree (member_id);


--
-- Name: idx_membership_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_membership_status ON public.member_memberships USING btree (status);


--
-- Name: idx_mts_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mts_created_at ON public.member_team_subscriptions USING btree (created_at);


--
-- Name: idx_mts_member_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mts_member_id ON public.member_team_subscriptions USING btree (member_id);


--
-- Name: idx_mts_member_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mts_member_status ON public.member_team_subscriptions USING btree (member_id, status);


--
-- Name: idx_mts_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mts_status ON public.member_team_subscriptions USING btree (status);


--
-- Name: idx_mts_team_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mts_team_id ON public.member_team_subscriptions USING btree (team_id);


--
-- Name: idx_mts_team_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mts_team_status ON public.member_team_subscriptions USING btree (team_id, status);


--
-- Name: idx_outsider_member; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_outsider_member ON public.outsider_details USING btree (member_id);


--
-- Name: idx_relationship_member; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_relationship_member ON public.member_relationships USING btree (member_id);


--
-- Name: idx_relationship_related; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_relationship_related ON public.member_relationships USING btree (related_member_id);


--
-- Name: idx_retired_member; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_retired_member ON public.retired_employee_details USING btree (member_id);


--
-- Name: idx_sport_branch_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sport_branch_status ON public.sport_branches USING btree (status);


--
-- Name: idx_sport_branches_branch_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sport_branches_branch_id ON public.sport_branches USING btree (branch_id);


--
-- Name: idx_sport_branches_sport_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sport_branches_sport_id ON public.sport_branches USING btree (sport_id);


--
-- Name: idx_team_member_account; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_team_member_account ON public.team_members USING btree (account_id);


--
-- Name: idx_team_member_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_team_member_status ON public.team_members USING btree (status);


--
-- Name: idx_team_member_teams_team_member_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_team_member_teams_team_member_id ON public.team_member_teams USING btree (team_member_id);


--
-- Name: idx_tmts_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tmts_created_at ON public.team_member_team_subscriptions USING btree (created_at);


--
-- Name: idx_tmts_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tmts_status ON public.team_member_team_subscriptions USING btree (status);


--
-- Name: idx_tmts_team_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tmts_team_id ON public.team_member_team_subscriptions USING btree (team_id);


--
-- Name: idx_tmts_team_member_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tmts_team_member_id ON public.team_member_team_subscriptions USING btree (team_member_id);


--
-- Name: idx_tmts_team_member_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tmts_team_member_status ON public.team_member_team_subscriptions USING btree (team_member_id, status);


--
-- Name: idx_tmts_team_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tmts_team_status ON public.team_member_team_subscriptions USING btree (team_id, status);


--
-- Name: idx_uni_student_member; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_uni_student_member ON public.university_student_details USING btree (member_id);


--
-- Name: unique_field_booking; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_field_booking ON public.bookings USING btree (field_id, start_time, end_time) WHERE ((status)::text = ANY ((ARRAY['pending_payment'::character varying, 'confirmed'::character varying])::text[]));


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_action_filter_key; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_action_filter_key ON realtime.subscription USING btree (subscription_id, entity, filters, action_filter);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_bucket_id_name_lower; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name_lower ON storage.objects USING btree (bucket_id, lower(name) COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: bookings set_timestamp_bookings; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_timestamp_bookings BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: fields set_timestamp_fields; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_timestamp_fields BEFORE UPDATE ON public.fields FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: announcements trigger_announcements_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: branch_sport_teams trigger_branch_sport_teams_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_branch_sport_teams_updated_at BEFORE UPDATE ON public.branch_sport_teams FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: member_team_subscriptions trigger_member_team_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_member_team_subscriptions_updated_at BEFORE UPDATE ON public.member_team_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: team_member_team_subscriptions trigger_team_member_team_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_team_member_team_subscriptions_updated_at BEFORE UPDATE ON public.team_member_team_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: buckets protect_buckets_delete; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects protect_objects_delete; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: staff FK_033c2ff321c67885781aa563581; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT "FK_033c2ff321c67885781aa563581" FOREIGN KEY (staff_type_id) REFERENCES public.staff_types(id);


--
-- Name: staff_privileges_override FK_09988fb0363aa3a5d5ba4952afe; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_privileges_override
    ADD CONSTRAINT "FK_09988fb0363aa3a5d5ba4952afe" FOREIGN KEY (privilege_id) REFERENCES public.privileges(id) ON DELETE CASCADE;


--
-- Name: advertisements FK_11ad11390e35dd24080dea221cd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advertisements
    ADD CONSTRAINT "FK_11ad11390e35dd24080dea221cd" FOREIGN KEY (category_id) REFERENCES public.advertisement_categories(id);


--
-- Name: advertisement_photos FK_13f5febfd4324f34e95a8c2001b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advertisement_photos
    ADD CONSTRAINT "FK_13f5febfd4324f34e95a8c2001b" FOREIGN KEY (advertisement_id) REFERENCES public.advertisements(id) ON DELETE CASCADE;


--
-- Name: member_relationships FK_18b3b0a7a0861a9260948a569f2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_relationships
    ADD CONSTRAINT "FK_18b3b0a7a0861a9260948a569f2" FOREIGN KEY (related_member_id) REFERENCES public.members(id);


--
-- Name: sport_branches FK_34df85539a0e71c0cf9ace745e4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sport_branches
    ADD CONSTRAINT "FK_34df85539a0e71c0cf9ace745e4" FOREIGN KEY (sport_id) REFERENCES public.sports(id) ON DELETE CASCADE;


--
-- Name: member_team_subscriptions FK_34e97ab404f86e2bf24723b298e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_team_subscriptions
    ADD CONSTRAINT "FK_34e97ab404f86e2bf24723b298e" FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;


--
-- Name: member_relationships FK_37b61d254a9dea14f2ef7f1add0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_relationships
    ADD CONSTRAINT "FK_37b61d254a9dea14f2ef7f1add0" FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: sports FK_393d8edd63dd2a7f0750b6d7243; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sports
    ADD CONSTRAINT "FK_393d8edd63dd2a7f0750b6d7243" FOREIGN KEY (created_by_staff_id) REFERENCES public.staff(id) ON DELETE CASCADE;


--
-- Name: staff_activity_logs FK_4864905fe52777c6acaf05c63f2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_activity_logs
    ADD CONSTRAINT "FK_4864905fe52777c6acaf05c63f2" FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE CASCADE;


--
-- Name: advertisements FK_49d69aaf2e6b35989ee647f85ae; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advertisements
    ADD CONSTRAINT "FK_49d69aaf2e6b35989ee647f85ae" FOREIGN KEY (created_by) REFERENCES public.staff(id);


--
-- Name: staff FK_4d2399aabd15dae3014759ae87d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT "FK_4d2399aabd15dae3014759ae87d" FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;


--
-- Name: member_team_subscriptions FK_4df6dfcd6f7586919f6d71708c2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_team_subscriptions
    ADD CONSTRAINT "FK_4df6dfcd6f7586919f6d71708c2" FOREIGN KEY (announcement_id) REFERENCES public.announcements(id);


--
-- Name: branch_sport_teams FK_500f48a90ce325ac4ca43372980; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branch_sport_teams
    ADD CONSTRAINT "FK_500f48a90ce325ac4ca43372980" FOREIGN KEY (created_by_staff_id) REFERENCES public.staff(id);


--
-- Name: staff_privileges_override FK_5030f5e915c0be480ecb51719e2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_privileges_override
    ADD CONSTRAINT "FK_5030f5e915c0be480ecb51719e2" FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE CASCADE;


--
-- Name: activity_logs FK_537a22371dd962659e2199450da; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT "FK_537a22371dd962659e2199450da" FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: branch_sport_teams FK_541ede056317834936f1e4f3e6c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branch_sport_teams
    ADD CONSTRAINT "FK_541ede056317834936f1e4f3e6c" FOREIGN KEY (sport_id) REFERENCES public.sports(id) ON DELETE CASCADE;


--
-- Name: retired_employee_details FK_572ac1a4ffeab682c2e6e94a033; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.retired_employee_details
    ADD CONSTRAINT "FK_572ac1a4ffeab682c2e6e94a033" FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: sport_branches FK_5a0b37c6277cc0f56cf47263380; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sport_branches
    ADD CONSTRAINT "FK_5a0b37c6277cc0f56cf47263380" FOREIGN KEY (created_by_staff_id) REFERENCES public.staff(id);


--
-- Name: branch_sport_teams FK_5a508183b1bf316036992d2e7ad; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branch_sport_teams
    ADD CONSTRAINT "FK_5a508183b1bf316036992d2e7ad" FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: members FK_5c05e0f6998f982aeb68c73e373; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT "FK_5c05e0f6998f982aeb68c73e373" FOREIGN KEY (member_type_id) REFERENCES public.member_types(id);


--
-- Name: branch_sport_teams FK_618dc73ce93d677427dba897e91; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branch_sport_teams
    ADD CONSTRAINT "FK_618dc73ce93d677427dba897e91" FOREIGN KEY (approved_by_staff_id) REFERENCES public.staff(id);


--
-- Name: member_memberships FK_6678dedb4ec622799f6c2b064a6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_memberships
    ADD CONSTRAINT "FK_6678dedb4ec622799f6c2b064a6" FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: staff_packages FK_73a5e988b5f904320a4d7bacefa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_packages
    ADD CONSTRAINT "FK_73a5e988b5f904320a4d7bacefa" FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE CASCADE;


--
-- Name: member_teams FK_7a121348af73f30a634c872ce16; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_teams
    ADD CONSTRAINT "FK_7a121348af73f30a634c872ce16" FOREIGN KEY (team_id) REFERENCES public.sports(id);


--
-- Name: university_student_details FK_7a23f0ea6c43d33994fef2e89ab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.university_student_details
    ADD CONSTRAINT "FK_7a23f0ea6c43d33994fef2e89ab" FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: team_member_team_subscriptions FK_828d221066be24266e901f15593; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_member_team_subscriptions
    ADD CONSTRAINT "FK_828d221066be24266e901f15593" FOREIGN KEY (team_id) REFERENCES public.branch_sport_teams(id) ON DELETE CASCADE;


--
-- Name: outsider_details FK_84d24e0972729fa85a8147d2f44; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.outsider_details
    ADD CONSTRAINT "FK_84d24e0972729fa85a8147d2f44" FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: staff_packages FK_89161db4e532a39136cfdf7fc3a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_packages
    ADD CONSTRAINT "FK_89161db4e532a39136cfdf7fc3a" FOREIGN KEY (package_id) REFERENCES public.packages(id) ON DELETE CASCADE;


--
-- Name: announcements FK_8dd248667c8d4d3b55d483239a9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT "FK_8dd248667c8d4d3b55d483239a9" FOREIGN KEY (sport_id) REFERENCES public.sports(id) ON DELETE CASCADE;


--
-- Name: staff_package_privileges FK_8e803b9cb17b5a70f0cae729a9c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_package_privileges
    ADD CONSTRAINT "FK_8e803b9cb17b5a70f0cae729a9c" FOREIGN KEY (privilege_id) REFERENCES public.privileges(id) ON DELETE CASCADE;


--
-- Name: team_member_teams FK_9c53cb1c8208713af5e8a0fd52c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_member_teams
    ADD CONSTRAINT "FK_9c53cb1c8208713af5e8a0fd52c" FOREIGN KEY (team_member_id) REFERENCES public.team_members(id);


--
-- Name: member_team_subscriptions FK_9f1b7eea77a3e81efbe6551c6b8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_team_subscriptions
    ADD CONSTRAINT "FK_9f1b7eea77a3e81efbe6551c6b8" FOREIGN KEY (team_id) REFERENCES public.branch_sport_teams(id) ON DELETE CASCADE;


--
-- Name: university_student_details FK_aae8fd0f54003779607b8862af3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.university_student_details
    ADD CONSTRAINT "FK_aae8fd0f54003779607b8862af3" FOREIGN KEY (faculty_id) REFERENCES public.faculties(id);


--
-- Name: employee_details FK_ab316e333d6b1340bbb9b085bbd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_details
    ADD CONSTRAINT "FK_ab316e333d6b1340bbb9b085bbd" FOREIGN KEY (profession_id) REFERENCES public.professions(id);


--
-- Name: sports FK_afbcb2e18168f9953dcf5323c90; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sports
    ADD CONSTRAINT "FK_afbcb2e18168f9953dcf5323c90" FOREIGN KEY (approved_by_staff_id) REFERENCES public.staff(id);


--
-- Name: staff_package_privileges FK_b0de2474c30a70a6e7808d42087; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_package_privileges
    ADD CONSTRAINT "FK_b0de2474c30a70a6e7808d42087" FOREIGN KEY (package_id) REFERENCES public.packages(id) ON DELETE CASCADE;


--
-- Name: member_memberships FK_b3abd06e7d54744a465cae28e45; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_memberships
    ADD CONSTRAINT "FK_b3abd06e7d54744a465cae28e45" FOREIGN KEY (membership_plan_id) REFERENCES public.membership_plans(id);


--
-- Name: team_member_team_subscriptions FK_b4d96f89e3f6b01de371a2a9442; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_member_team_subscriptions
    ADD CONSTRAINT "FK_b4d96f89e3f6b01de371a2a9442" FOREIGN KEY (announcement_id) REFERENCES public.announcements(id);


--
-- Name: team_member_team_subscriptions FK_b56c17473724dedd599a8edba30; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_member_team_subscriptions
    ADD CONSTRAINT "FK_b56c17473724dedd599a8edba30" FOREIGN KEY (team_member_id) REFERENCES public.team_members(id) ON DELETE CASCADE;


--
-- Name: outsider_details FK_c2c2ef9ea07bd29bed0aa144c9e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.outsider_details
    ADD CONSTRAINT "FK_c2c2ef9ea07bd29bed0aa144c9e" FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: team_members FK_c2d2b65f142ec7e11625d207e48; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT "FK_c2d2b65f142ec7e11625d207e48" FOREIGN KEY (account_id) REFERENCES public.accounts(id);


--
-- Name: announcements FK_c6f70af95eeeb43d10dc64e9e6b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT "FK_c6f70af95eeeb43d10dc64e9e6b" FOREIGN KEY (created_by_staff_id) REFERENCES public.staff(id) ON DELETE CASCADE;


--
-- Name: member_team_subscriptions FK_c76c8c49dfca9c45bdabab586cd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_team_subscriptions
    ADD CONSTRAINT "FK_c76c8c49dfca9c45bdabab586cd" FOREIGN KEY (created_by_staff_id) REFERENCES public.staff(id);


--
-- Name: employee_details FK_ce616d2905a24ea751ee4a155d7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_details
    ADD CONSTRAINT "FK_ce616d2905a24ea751ee4a155d7" FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: sport_branches FK_d5a3f29c51f3f4b13ba11de6132; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sport_branches
    ADD CONSTRAINT "FK_d5a3f29c51f3f4b13ba11de6132" FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: announcements FK_d8cf6a4746e15e59a6f19e2d0a6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT "FK_d8cf6a4746e15e59a6f19e2d0a6" FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE SET NULL;


--
-- Name: advertisements FK_dd489d36fbae3aac8b4d61e970f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advertisements
    ADD CONSTRAINT "FK_dd489d36fbae3aac8b4d61e970f" FOREIGN KEY (approved_by) REFERENCES public.staff(id);


--
-- Name: member_team_subscriptions FK_df8672bd8a4c1fe28958e732703; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_team_subscriptions
    ADD CONSTRAINT "FK_df8672bd8a4c1fe28958e732703" FOREIGN KEY (approved_by_staff_id) REFERENCES public.staff(id);


--
-- Name: team_member_team_subscriptions FK_e51480ed4b74f8ad64908eacc85; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_member_team_subscriptions
    ADD CONSTRAINT "FK_e51480ed4b74f8ad64908eacc85" FOREIGN KEY (created_by_staff_id) REFERENCES public.staff(id);


--
-- Name: team_member_team_subscriptions FK_e9b0987b7da6433631b7ebb6a09; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_member_team_subscriptions
    ADD CONSTRAINT "FK_e9b0987b7da6433631b7ebb6a09" FOREIGN KEY (approved_by_staff_id) REFERENCES public.staff(id);


--
-- Name: member_teams FK_efedd3dd196df032f7afe47638e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_teams
    ADD CONSTRAINT "FK_efedd3dd196df032f7afe47638e" FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: membership_plans FK_fa94845ddeeed2afa8a7a30bd82; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membership_plans
    ADD CONSTRAINT "FK_fa94845ddeeed2afa8a7a30bd82" FOREIGN KEY (member_type_id) REFERENCES public.member_types(id);


--
-- Name: members FK_fd9dfb97e21b75fc45d42aa614a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT "FK_fd9dfb97e21b75fc45d42aa614a" FOREIGN KEY (account_id) REFERENCES public.accounts(id);


--
-- Name: booking_participants booking_participants_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_participants
    ADD CONSTRAINT booking_participants_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_field_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_field_id_fkey FOREIGN KEY (field_id) REFERENCES public.fields(id) ON DELETE RESTRICT;


--
-- Name: bookings bookings_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_sport_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_sport_id_fkey FOREIGN KEY (sport_id) REFERENCES public.sports(id) ON DELETE RESTRICT;


--
-- Name: bookings bookings_team_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_team_member_id_fkey FOREIGN KEY (team_member_id) REFERENCES public.team_members(id) ON DELETE CASCADE;


--
-- Name: field_operating_hours field_operating_hours_field_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.field_operating_hours
    ADD CONSTRAINT field_operating_hours_field_id_fkey FOREIGN KEY (field_id) REFERENCES public.fields(id) ON DELETE CASCADE;


--
-- Name: fields fields_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fields
    ADD CONSTRAINT fields_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE SET NULL;


--
-- Name: fields fields_sport_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fields
    ADD CONSTRAINT fields_sport_id_fkey FOREIGN KEY (sport_id) REFERENCES public.sports(id) ON DELETE RESTRICT;


--
-- Name: privileges_packages privileges_packages_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.privileges_packages
    ADD CONSTRAINT privileges_packages_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.packages(id) ON DELETE CASCADE;


--
-- Name: privileges_packages privileges_packages_privilege_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.privileges_packages
    ADD CONSTRAINT privileges_packages_privilege_id_fkey FOREIGN KEY (privilege_id) REFERENCES public.privileges(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea, text[], text[]) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.crypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.dearmor(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_bytes(integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_uuid() FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text, integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO dashboard_user;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_key_id(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1mc() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v4() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_nil() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_dns() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_oid() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_url() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_x500() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION pg_reload_conf(); Type: ACL; Schema: pg_catalog; Owner: supabase_admin
--

GRANT ALL ON FUNCTION pg_catalog.pg_reload_conf() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;


--
-- Name: FUNCTION trigger_set_timestamp(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.trigger_set_timestamp() TO anon;
GRANT ALL ON FUNCTION public.trigger_set_timestamp() TO authenticated;
GRANT ALL ON FUNCTION public.trigger_set_timestamp() TO service_role;


--
-- Name: FUNCTION update_timestamp(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_timestamp() TO anon;
GRANT ALL ON FUNCTION public.update_timestamp() TO authenticated;
GRANT ALL ON FUNCTION public.update_timestamp() TO service_role;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE custom_oauth_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.custom_oauth_providers TO postgres;
GRANT ALL ON TABLE auth.custom_oauth_providers TO dashboard_user;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- Name: TABLE oauth_authorizations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_authorizations TO postgres;
GRANT ALL ON TABLE auth.oauth_authorizations TO dashboard_user;


--
-- Name: TABLE oauth_client_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_client_states TO postgres;
GRANT ALL ON TABLE auth.oauth_client_states TO dashboard_user;


--
-- Name: TABLE oauth_clients; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_clients TO postgres;
GRANT ALL ON TABLE auth.oauth_clients TO dashboard_user;


--
-- Name: TABLE oauth_consents; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_consents TO postgres;
GRANT ALL ON TABLE auth.oauth_consents TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements_info FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- Name: TABLE accounts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.accounts TO anon;
GRANT ALL ON TABLE public.accounts TO authenticated;
GRANT ALL ON TABLE public.accounts TO service_role;


--
-- Name: SEQUENCE accounts_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.accounts_id_seq TO anon;
GRANT ALL ON SEQUENCE public.accounts_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.accounts_id_seq TO service_role;


--
-- Name: TABLE activity_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.activity_logs TO anon;
GRANT ALL ON TABLE public.activity_logs TO authenticated;
GRANT ALL ON TABLE public.activity_logs TO service_role;


--
-- Name: SEQUENCE activity_logs_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.activity_logs_id_seq TO anon;
GRANT ALL ON SEQUENCE public.activity_logs_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.activity_logs_id_seq TO service_role;


--
-- Name: TABLE advertisement_categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.advertisement_categories TO anon;
GRANT ALL ON TABLE public.advertisement_categories TO authenticated;
GRANT ALL ON TABLE public.advertisement_categories TO service_role;


--
-- Name: SEQUENCE advertisement_categories_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.advertisement_categories_id_seq TO anon;
GRANT ALL ON SEQUENCE public.advertisement_categories_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.advertisement_categories_id_seq TO service_role;


--
-- Name: TABLE advertisement_photos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.advertisement_photos TO anon;
GRANT ALL ON TABLE public.advertisement_photos TO authenticated;
GRANT ALL ON TABLE public.advertisement_photos TO service_role;


--
-- Name: SEQUENCE advertisement_photos_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.advertisement_photos_id_seq TO anon;
GRANT ALL ON SEQUENCE public.advertisement_photos_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.advertisement_photos_id_seq TO service_role;


--
-- Name: TABLE advertisements; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.advertisements TO anon;
GRANT ALL ON TABLE public.advertisements TO authenticated;
GRANT ALL ON TABLE public.advertisements TO service_role;


--
-- Name: SEQUENCE advertisements_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.advertisements_id_seq TO anon;
GRANT ALL ON SEQUENCE public.advertisements_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.advertisements_id_seq TO service_role;


--
-- Name: TABLE announcements; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.announcements TO anon;
GRANT ALL ON TABLE public.announcements TO authenticated;
GRANT ALL ON TABLE public.announcements TO service_role;


--
-- Name: SEQUENCE announcements_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.announcements_id_seq TO anon;
GRANT ALL ON SEQUENCE public.announcements_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.announcements_id_seq TO service_role;


--
-- Name: TABLE audit_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.audit_logs TO anon;
GRANT ALL ON TABLE public.audit_logs TO authenticated;
GRANT ALL ON TABLE public.audit_logs TO service_role;


--
-- Name: TABLE booking_participants; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.booking_participants TO anon;
GRANT ALL ON TABLE public.booking_participants TO authenticated;
GRANT ALL ON TABLE public.booking_participants TO service_role;


--
-- Name: TABLE bookings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.bookings TO anon;
GRANT ALL ON TABLE public.bookings TO authenticated;
GRANT ALL ON TABLE public.bookings TO service_role;


--
-- Name: TABLE branch_sport_teams; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.branch_sport_teams TO anon;
GRANT ALL ON TABLE public.branch_sport_teams TO authenticated;
GRANT ALL ON TABLE public.branch_sport_teams TO service_role;


--
-- Name: SEQUENCE branch_sport_teams_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.branch_sport_teams_id_seq TO anon;
GRANT ALL ON SEQUENCE public.branch_sport_teams_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.branch_sport_teams_id_seq TO service_role;


--
-- Name: TABLE branches; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.branches TO anon;
GRANT ALL ON TABLE public.branches TO authenticated;
GRANT ALL ON TABLE public.branches TO service_role;


--
-- Name: SEQUENCE branches_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.branches_id_seq TO anon;
GRANT ALL ON SEQUENCE public.branches_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.branches_id_seq TO service_role;


--
-- Name: TABLE employee_details; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.employee_details TO anon;
GRANT ALL ON TABLE public.employee_details TO authenticated;
GRANT ALL ON TABLE public.employee_details TO service_role;


--
-- Name: SEQUENCE employee_details_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.employee_details_id_seq TO anon;
GRANT ALL ON SEQUENCE public.employee_details_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.employee_details_id_seq TO service_role;


--
-- Name: TABLE faculties; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.faculties TO anon;
GRANT ALL ON TABLE public.faculties TO authenticated;
GRANT ALL ON TABLE public.faculties TO service_role;


--
-- Name: SEQUENCE faculties_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.faculties_id_seq TO anon;
GRANT ALL ON SEQUENCE public.faculties_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.faculties_id_seq TO service_role;


--
-- Name: TABLE field_operating_hours; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.field_operating_hours TO anon;
GRANT ALL ON TABLE public.field_operating_hours TO authenticated;
GRANT ALL ON TABLE public.field_operating_hours TO service_role;


--
-- Name: TABLE fields; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.fields TO anon;
GRANT ALL ON TABLE public.fields TO authenticated;
GRANT ALL ON TABLE public.fields TO service_role;


--
-- Name: TABLE media_posts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.media_posts TO anon;
GRANT ALL ON TABLE public.media_posts TO authenticated;
GRANT ALL ON TABLE public.media_posts TO service_role;


--
-- Name: SEQUENCE media_posts_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.media_posts_id_seq TO anon;
GRANT ALL ON SEQUENCE public.media_posts_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.media_posts_id_seq TO service_role;


--
-- Name: TABLE member_memberships; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.member_memberships TO anon;
GRANT ALL ON TABLE public.member_memberships TO authenticated;
GRANT ALL ON TABLE public.member_memberships TO service_role;


--
-- Name: SEQUENCE member_memberships_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.member_memberships_id_seq TO anon;
GRANT ALL ON SEQUENCE public.member_memberships_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.member_memberships_id_seq TO service_role;


--
-- Name: TABLE member_relationships; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.member_relationships TO anon;
GRANT ALL ON TABLE public.member_relationships TO authenticated;
GRANT ALL ON TABLE public.member_relationships TO service_role;


--
-- Name: SEQUENCE member_relationships_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.member_relationships_id_seq TO anon;
GRANT ALL ON SEQUENCE public.member_relationships_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.member_relationships_id_seq TO service_role;


--
-- Name: TABLE member_team_subscriptions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.member_team_subscriptions TO anon;
GRANT ALL ON TABLE public.member_team_subscriptions TO authenticated;
GRANT ALL ON TABLE public.member_team_subscriptions TO service_role;


--
-- Name: SEQUENCE member_team_subscriptions_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.member_team_subscriptions_id_seq TO anon;
GRANT ALL ON SEQUENCE public.member_team_subscriptions_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.member_team_subscriptions_id_seq TO service_role;


--
-- Name: TABLE member_teams; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.member_teams TO anon;
GRANT ALL ON TABLE public.member_teams TO authenticated;
GRANT ALL ON TABLE public.member_teams TO service_role;


--
-- Name: SEQUENCE member_teams_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.member_teams_id_seq TO anon;
GRANT ALL ON SEQUENCE public.member_teams_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.member_teams_id_seq TO service_role;


--
-- Name: TABLE member_types; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.member_types TO anon;
GRANT ALL ON TABLE public.member_types TO authenticated;
GRANT ALL ON TABLE public.member_types TO service_role;


--
-- Name: SEQUENCE member_types_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.member_types_id_seq TO anon;
GRANT ALL ON SEQUENCE public.member_types_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.member_types_id_seq TO service_role;


--
-- Name: TABLE members; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.members TO anon;
GRANT ALL ON TABLE public.members TO authenticated;
GRANT ALL ON TABLE public.members TO service_role;


--
-- Name: SEQUENCE members_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.members_id_seq TO anon;
GRANT ALL ON SEQUENCE public.members_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.members_id_seq TO service_role;


--
-- Name: TABLE membership_plans; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.membership_plans TO anon;
GRANT ALL ON TABLE public.membership_plans TO authenticated;
GRANT ALL ON TABLE public.membership_plans TO service_role;


--
-- Name: SEQUENCE membership_plans_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.membership_plans_id_seq TO anon;
GRANT ALL ON SEQUENCE public.membership_plans_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.membership_plans_id_seq TO service_role;


--
-- Name: TABLE outsider_details; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.outsider_details TO anon;
GRANT ALL ON TABLE public.outsider_details TO authenticated;
GRANT ALL ON TABLE public.outsider_details TO service_role;


--
-- Name: SEQUENCE outsider_details_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.outsider_details_id_seq TO anon;
GRANT ALL ON SEQUENCE public.outsider_details_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.outsider_details_id_seq TO service_role;


--
-- Name: TABLE packages; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.packages TO anon;
GRANT ALL ON TABLE public.packages TO authenticated;
GRANT ALL ON TABLE public.packages TO service_role;


--
-- Name: SEQUENCE packages_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.packages_id_seq TO anon;
GRANT ALL ON SEQUENCE public.packages_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.packages_id_seq TO service_role;


--
-- Name: SEQUENCE privilege_packages_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.privilege_packages_id_seq TO anon;
GRANT ALL ON SEQUENCE public.privilege_packages_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.privilege_packages_id_seq TO service_role;


--
-- Name: TABLE privileges; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.privileges TO anon;
GRANT ALL ON TABLE public.privileges TO authenticated;
GRANT ALL ON TABLE public.privileges TO service_role;


--
-- Name: SEQUENCE privileges_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.privileges_id_seq TO anon;
GRANT ALL ON SEQUENCE public.privileges_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.privileges_id_seq TO service_role;


--
-- Name: TABLE privileges_packages; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.privileges_packages TO anon;
GRANT ALL ON TABLE public.privileges_packages TO authenticated;
GRANT ALL ON TABLE public.privileges_packages TO service_role;


--
-- Name: TABLE professions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.professions TO anon;
GRANT ALL ON TABLE public.professions TO authenticated;
GRANT ALL ON TABLE public.professions TO service_role;


--
-- Name: SEQUENCE professions_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.professions_id_seq TO anon;
GRANT ALL ON SEQUENCE public.professions_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.professions_id_seq TO service_role;


--
-- Name: TABLE retired_employee_details; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.retired_employee_details TO anon;
GRANT ALL ON TABLE public.retired_employee_details TO authenticated;
GRANT ALL ON TABLE public.retired_employee_details TO service_role;


--
-- Name: SEQUENCE retired_employee_details_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.retired_employee_details_id_seq TO anon;
GRANT ALL ON SEQUENCE public.retired_employee_details_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.retired_employee_details_id_seq TO service_role;


--
-- Name: TABLE sport_branches; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.sport_branches TO anon;
GRANT ALL ON TABLE public.sport_branches TO authenticated;
GRANT ALL ON TABLE public.sport_branches TO service_role;


--
-- Name: SEQUENCE sport_branches_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.sport_branches_id_seq TO anon;
GRANT ALL ON SEQUENCE public.sport_branches_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.sport_branches_id_seq TO service_role;


--
-- Name: TABLE sports; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.sports TO anon;
GRANT ALL ON TABLE public.sports TO authenticated;
GRANT ALL ON TABLE public.sports TO service_role;


--
-- Name: SEQUENCE sports_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.sports_id_seq TO anon;
GRANT ALL ON SEQUENCE public.sports_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.sports_id_seq TO service_role;


--
-- Name: TABLE staff; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.staff TO anon;
GRANT ALL ON TABLE public.staff TO authenticated;
GRANT ALL ON TABLE public.staff TO service_role;


--
-- Name: TABLE staff_action_approvals; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.staff_action_approvals TO anon;
GRANT ALL ON TABLE public.staff_action_approvals TO authenticated;
GRANT ALL ON TABLE public.staff_action_approvals TO service_role;


--
-- Name: SEQUENCE staff_action_approvals_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.staff_action_approvals_id_seq TO anon;
GRANT ALL ON SEQUENCE public.staff_action_approvals_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.staff_action_approvals_id_seq TO service_role;


--
-- Name: TABLE staff_activity_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.staff_activity_logs TO anon;
GRANT ALL ON TABLE public.staff_activity_logs TO authenticated;
GRANT ALL ON TABLE public.staff_activity_logs TO service_role;


--
-- Name: SEQUENCE staff_activity_logs_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.staff_activity_logs_id_seq TO anon;
GRANT ALL ON SEQUENCE public.staff_activity_logs_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.staff_activity_logs_id_seq TO service_role;


--
-- Name: SEQUENCE staff_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.staff_id_seq TO anon;
GRANT ALL ON SEQUENCE public.staff_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.staff_id_seq TO service_role;


--
-- Name: TABLE staff_package_privileges; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.staff_package_privileges TO anon;
GRANT ALL ON TABLE public.staff_package_privileges TO authenticated;
GRANT ALL ON TABLE public.staff_package_privileges TO service_role;


--
-- Name: TABLE staff_packages; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.staff_packages TO anon;
GRANT ALL ON TABLE public.staff_packages TO authenticated;
GRANT ALL ON TABLE public.staff_packages TO service_role;


--
-- Name: TABLE staff_privileges_override; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.staff_privileges_override TO anon;
GRANT ALL ON TABLE public.staff_privileges_override TO authenticated;
GRANT ALL ON TABLE public.staff_privileges_override TO service_role;


--
-- Name: TABLE staff_types; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.staff_types TO anon;
GRANT ALL ON TABLE public.staff_types TO authenticated;
GRANT ALL ON TABLE public.staff_types TO service_role;


--
-- Name: SEQUENCE staff_types_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.staff_types_id_seq TO anon;
GRANT ALL ON SEQUENCE public.staff_types_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.staff_types_id_seq TO service_role;


--
-- Name: TABLE tasks; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tasks TO anon;
GRANT ALL ON TABLE public.tasks TO authenticated;
GRANT ALL ON TABLE public.tasks TO service_role;


--
-- Name: SEQUENCE tasks_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.tasks_id_seq TO anon;
GRANT ALL ON SEQUENCE public.tasks_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.tasks_id_seq TO service_role;


--
-- Name: TABLE team_member_details; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.team_member_details TO anon;
GRANT ALL ON TABLE public.team_member_details TO authenticated;
GRANT ALL ON TABLE public.team_member_details TO service_role;


--
-- Name: SEQUENCE team_member_details_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.team_member_details_id_seq TO anon;
GRANT ALL ON SEQUENCE public.team_member_details_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.team_member_details_id_seq TO service_role;


--
-- Name: TABLE team_member_team_subscriptions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.team_member_team_subscriptions TO anon;
GRANT ALL ON TABLE public.team_member_team_subscriptions TO authenticated;
GRANT ALL ON TABLE public.team_member_team_subscriptions TO service_role;


--
-- Name: SEQUENCE team_member_team_subscriptions_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.team_member_team_subscriptions_id_seq TO anon;
GRANT ALL ON SEQUENCE public.team_member_team_subscriptions_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.team_member_team_subscriptions_id_seq TO service_role;


--
-- Name: TABLE team_member_teams; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.team_member_teams TO anon;
GRANT ALL ON TABLE public.team_member_teams TO authenticated;
GRANT ALL ON TABLE public.team_member_teams TO service_role;


--
-- Name: SEQUENCE team_member_teams_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.team_member_teams_id_seq TO anon;
GRANT ALL ON SEQUENCE public.team_member_teams_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.team_member_teams_id_seq TO service_role;


--
-- Name: TABLE team_members; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.team_members TO anon;
GRANT ALL ON TABLE public.team_members TO authenticated;
GRANT ALL ON TABLE public.team_members TO service_role;


--
-- Name: SEQUENCE team_members_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.team_members_id_seq TO anon;
GRANT ALL ON SEQUENCE public.team_members_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.team_members_id_seq TO service_role;


--
-- Name: TABLE university_student_details; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.university_student_details TO anon;
GRANT ALL ON TABLE public.university_student_details TO authenticated;
GRANT ALL ON TABLE public.university_student_details TO service_role;


--
-- Name: SEQUENCE university_student_details_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.university_student_details_id_seq TO anon;
GRANT ALL ON SEQUENCE public.university_student_details_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.university_student_details_id_seq TO service_role;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.buckets FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.buckets TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;


--
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets_analytics TO service_role;
GRANT ALL ON TABLE storage.buckets_analytics TO authenticated;
GRANT ALL ON TABLE storage.buckets_analytics TO anon;


--
-- Name: TABLE buckets_vectors; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.buckets_vectors TO service_role;
GRANT SELECT ON TABLE storage.buckets_vectors TO authenticated;
GRANT SELECT ON TABLE storage.buckets_vectors TO anon;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.objects FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.objects TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE vector_indexes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.vector_indexes TO service_role;
GRANT SELECT ON TABLE storage.vector_indexes TO authenticated;
GRANT SELECT ON TABLE storage.vector_indexes TO anon;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

\unrestrict lnp3tVxrAAaMcsAYdoBVrBxqLAxv4TGQKhsleuOWzPkNxgtYPBXSU6zYUb5aYRc

