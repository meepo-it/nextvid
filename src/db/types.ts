import { apikey, user } from "./auth.schema";
import { userFiles, payment, userCredit, videoGeneration, videoProvider, videoModelConfig } from "./app.schema";

export type User = typeof user.$inferSelect;
export type ApiKey = typeof apikey.$inferSelect;
export type UserFiles = typeof userFiles.$inferSelect;
export type Payment = typeof payment.$inferSelect;
export type UserCredit = typeof userCredit.$inferSelect;
export type VideoGeneration = typeof videoGeneration.$inferSelect;
export type VideoProvider = typeof videoProvider.$inferSelect;
export type VideoModelConfig = typeof videoModelConfig.$inferSelect;