import { redirect } from "@sveltejs/kit";

// The root page currently has no content to show
throw redirect(307, "/saved_problems");
