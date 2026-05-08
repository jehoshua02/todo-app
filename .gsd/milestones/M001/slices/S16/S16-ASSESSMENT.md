# S16 Assessment

**Milestone:** M001
**Slice:** S16
**Completed Slice:** S16
**Verdict:** roadmap-adjusted
**Created:** 2026-05-08T05:44:47.131Z

## Assessment

Adding S21 (Tailscale Funnel + env-driven compose + prod deployment) as the next slice. User needs passkey auth working on Android phone, which requires HTTPS on a real domain. Tailscale Funnel provides that. Both dev and prod environments will use identical compose files with different .env configs. No host ports published — all traffic through Funnel. Final task configures Windows service to keep WSL/Docker/Tailscale running after reboot. S21 must come before S18-S20 since it unblocks real-device testing.
