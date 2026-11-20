INSERT INTO records (title, category, description, status)
SELECT * FROM (VALUES
  ('Broken classroom light', 'Electrical', 'The light in Room B12 does not switch on.', 'Pending'),
  ('Leaking tap in library toilet', 'Plumbing', 'The tap in the ground floor library toilet drips all day.', 'In progress'),
  ('Broken lecture hall chair', 'Furniture', 'Chair in row 4 of Lecture Hall 2 has a broken leg.', 'Pending'),
  ('Flickering corridor lamp', 'Electrical', 'The lamp outside the computer lab flickers and buzzes.', 'Completed'),
  ('Blocked sink in hostel kitchen', 'Plumbing', 'Water drains very slowly in the Block C hostel kitchen sink.', 'In progress'),
  ('Wobbly study desk', 'Furniture', 'A desk on the second floor of the library wobbles when used.', 'Completed'),
  ('Socket without power', 'Electrical', 'The wall socket near the front of Room A05 has no power.', 'Pending'),
  ('Broken toilet flush', 'Plumbing', 'The flush handle in the second floor staff toilet is loose.', 'Pending')
) AS v(title, category, description, status)
WHERE NOT EXISTS (SELECT 1 FROM records);