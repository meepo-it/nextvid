import { apikey, user } from "./auth.schema";
import { userFiles, payment, featureRequest, featureVote } from "./app.schema";

export type User = typeof user.$inferSelect;
export type ApiKey = typeof apikey.$inferSelect;
export type UserFiles = typeof userFiles.$inferSelect;
export type Payment = typeof payment.$inferSelect;
export type FeatureRequest = typeof featureRequest.$inferSelect;
export type FeatureVote = typeof featureVote.$inferSelect;