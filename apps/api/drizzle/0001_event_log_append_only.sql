-- The event log is append-only (NFR-21, NFR-22, NFR-23): rows can be inserted and read, never changed.
-- A trigger is used so the rule holds even for the table owner.
CREATE FUNCTION event_log_reject_change() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'event_log is append-only: % is not allowed', TG_OP USING ERRCODE = 'insufficient_privilege';
END;
$$;
--> statement-breakpoint
CREATE TRIGGER event_log_no_update_or_delete
BEFORE UPDATE OR DELETE ON event_log
FOR EACH ROW EXECUTE FUNCTION event_log_reject_change();
--> statement-breakpoint
CREATE TRIGGER event_log_no_truncate
BEFORE TRUNCATE ON event_log
FOR EACH STATEMENT EXECUTE FUNCTION event_log_reject_change();
