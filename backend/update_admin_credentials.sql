-- Update church admin credentials

-- Update admin.first to admin.bergen with password: admin.bergen
UPDATE church_admins
SET username = 'admin.bergen',
    password_hash = '$2b$10$CZNgl0SQBXTaNByTKzpEROQ517E/I3Irsc9VRwAGZq24AXraB0sIy'
WHERE username = 'admin.first';

-- Update admin.grace to admin.kristiansand with password: admin.kristiansand
UPDATE church_admins
SET username = 'admin.kristiansand',
    password_hash = '$2b$10$TUvWM3bKRoFf0AL/ZUl/y.INAD3nAo8FwJI6bfs9mZm.B0.iuSjEq'
WHERE username = 'admin.grace';

-- Update admin.hope to admin.oslo with password: admin.oslo
UPDATE church_admins
SET username = 'admin.oslo',
    password_hash = '$2b$10$Wx.nxugKaRcKl19WEGktyeEm9Jc6f2A1a7DGKYehFM13GjEEUdJz6'
WHERE username = 'admin.hope';

-- Display updated admins
SELECT id, church_id, username, full_name, email, is_active
FROM church_admins
ORDER BY church_id;
