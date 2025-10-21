DROP FUNCTION IF EXISTS sign_out_with_id(TEXT);

CREATE FUNCTION sign_out_with_id(id_card_number_input TEXT)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  result JSON;
  audit_table_exists BOOLEAN;
BEGIN
  SELECT id INTO v_user_id
  FROM public.profiles
  WHERE id_card_number = id_card_number_input;

  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'No user found with this ID card number. Please register your ID card first.'
    );
  END IF;

  DELETE FROM auth.sessions
  WHERE auth.sessions.user_id = v_user_id;

  result := json_build_object(
    'success', true,
    'message', 'Existing session has been logged out. You may now login.',
    'user_id', v_user_id
  );

  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'audit_logs'
  ) INTO audit_table_exists;

  IF audit_table_exists THEN
    INSERT INTO public.audit_logs (admin_id, action, resource_type, resource_id, details)
    VALUES (
      auth.uid(),
      'signout_with_id',
      'user',
      v_user_id::TEXT,
      json_build_object('signed_out_at', NOW(), 'method', 'id_card')
    );
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

