-- Bokföringslagen: en verifikation får inte ändras eller tas bort, bara rättas med en ny verifikation.
CREATE OR REPLACE FUNCTION dalarud_skydda_verifikation() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Verifikationer kan inte raderas. Gör en rättelse i stället.';
  END IF;
  IF TG_TABLE_NAME = 'verifications' AND (NEW.corrected_by_id IS DISTINCT FROM OLD.corrected_by_id)
     AND NEW.year = OLD.year AND NEW.number = OLD.number AND NEW.date = OLD.date AND NEW.text = OLD.text THEN
    RETURN NEW; -- enda tillåtna ändringen: markera att verifikationen har rättats
  END IF;
  RAISE EXCEPTION 'Verifikationer kan inte ändras. Gör en rättelse i stället.';
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER verifikation_skydd BEFORE UPDATE OR DELETE ON verifications FOR EACH ROW EXECUTE FUNCTION dalarud_skydda_verifikation();
--> statement-breakpoint
CREATE TRIGGER verifikationsrad_skydd BEFORE UPDATE OR DELETE ON verification_rows FOR EACH ROW EXECUTE FUNCTION dalarud_skydda_verifikation();
