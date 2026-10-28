// Replaces the CMS sign-out button: signing out happens in the portal, which owns the session.
export function BackToPortal() {
  return (
    <a href="/portal" style={{ fontWeight: 600 }}>
      Back to the staff portal
    </a>
  );
}
