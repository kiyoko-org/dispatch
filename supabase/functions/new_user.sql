BEGIN
  IF new.raw_user_meta_data->>'role' = 'user' THEN
    INSERT INTO public.profiles (id, first_name, middle_name, last_name, avatar_url, id_card_number, suffix, sex, birth_date, permanent_address_1, permanent_address_2, birth_city, birth_province, fcm_token)
    VALUES (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'middle_name', new.raw_user_meta_data->>'last_name', new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'id_card_number', new.raw_user_meta_data->>'suffix', new.raw_user_meta_data->>'sex', (new.raw_user_meta_data->>'birth_date')::DATE, new.raw_user_meta_data->>'permanent_address_1', new.raw_user_meta_data->>'permanent_address_2', new.raw_user_meta_data->>'birth_city', new.raw_user_meta_data->>'birth_province', new.raw_user_meta_data->>'fcm_token');
  ELSE
    INSERT INTO public.officers (id, first_name, middle_name, last_name, badge_number, rank, role, fcm_token)
    VALUES (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'middle_name', new.raw_user_meta_data->>'last_name', new.raw_user_meta_data->>'badge_number', new.raw_user_meta_data->>'rank', 'officer', new.raw_user_meta_data->>'fcm_token');
  END IF;

  RETURN new;
END;
