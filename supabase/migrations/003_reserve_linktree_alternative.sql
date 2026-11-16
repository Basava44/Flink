-- Reserve the /linktree-alternative marketing page path so no user can claim it as a handle.

INSERT INTO reserved_handles (handle) VALUES ('linktree-alternative')
ON CONFLICT DO NOTHING;
