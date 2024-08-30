import type { EntryGenerator } from "./$types";

export const entries: EntryGenerator = () => {
  return [{ invite_code: "fake-invite_code" }];
};

export function load({ params }) {
  return {
    invite_code: params.invite_code,
  };
}
