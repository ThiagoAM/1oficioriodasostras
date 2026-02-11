import { mysqlTable, varchar, text, boolean, timestamp, int } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const siteSettings = mysqlTable("site_settings", {
  id: int("id").primaryKey().autoincrement(),
  mainLogo: varchar("main_logo", { length: 255 }),
  footerLogo: varchar("footer_logo", { length: 255 }),
  browserTabName: text("browser_tab_name"),
  smtpHost: varchar("smtp_host", { length: 255 }),
  smtpPort: int("smtp_port"),
  smtpUser: varchar("smtp_user", { length: 255 }),
  smtpPassword: varchar("smtp_password", { length: 255 }),
  smtpSecure: boolean("smtp_secure").default(true),
  solicitacoesEmail: varchar("solicitacoes_email", { length: 255 }),
  apiUrl: varchar("api_url", { length: 500 }),
  apiToken: varchar("api_token", { length: 500 }),
  apiPort: int("api_port"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const contacts = mysqlTable("contacts", {
  id: int("id").primaryKey().autoincrement(),
  whatsapp: varchar("whatsapp", { length: 50 }),
  phone: varchar("phone", { length: 50 }),
  email: text("email"), // JSON array de emails
  address: text("address"),
  businessHours: text("business_hours"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const services = mysqlTable("services", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const banners = mysqlTable("banners", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  link: varchar("link", { length: 500 }),
  active: boolean("active").notNull().default(true),
  order: int("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const gallery = mysqlTable("gallery", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'image' or 'video'
  mediaUrl: varchar("media_url", { length: 500 }).notNull(), // image path or youtube url
  description: text("description"),
  active: boolean("active").notNull().default(true),
  order: int("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const solicitacoes = mysqlTable("solicitacoes", {
  id: int("id").primaryKey().autoincrement(),
  tipoSolicitacao: varchar("tipo_solicitacao", { length: 100 }).notNull(), // ex: "certidao-de-procuracao"
  nomeSolicitacao: varchar("nome_solicitacao", { length: 255 }).notNull(), // ex: "Certidão de Procuração"
  dadosFormulario: text("dados_formulario").notNull(), // JSON com todos os dados do formulário
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const pages = mysqlTable("pages", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const contactMessages = mysqlTable("contact_messages", {
  id: int("id").primaryKey().autoincrement(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  telefone: varchar("telefone", { length: 20 }).notNull(),
  mensagem: text("mensagem").notNull(),
  anexos: text("anexos"), // JSON array com caminhos dos arquivos
  lido: boolean("lido").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const googleSettings = mysqlTable("google_settings", {
  id: int("id").primaryKey().autoincrement(),
  placeId: varchar("place_id", { length: 255 }),
  apiKey: varchar("api_key", { length: 255 }),
  reviewsJson: text("reviews_json"), // Cache das avaliações em JSON
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const scripts = mysqlTable("scripts", {
  id: int("id").primaryKey().autoincrement(),
  googleTagManager: text("google_tag_manager"),
  facebookPixel: text("facebook_pixel"),
  googleAnalytics: text("google_analytics"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const socialMedia = mysqlTable("social_media", {
  id: int("id").primaryKey().autoincrement(),
  youtube: varchar("youtube", { length: 500 }),
  instagram: varchar("instagram", { length: 500 }),
  facebook: varchar("facebook", { length: 500 }),
  tiktok: varchar("tiktok", { length: 500 }),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const news = mysqlTable("news", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  imageUrl: varchar("image_url", { length: 500 }),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const links = mysqlTable("links", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  order: int("order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const informacoes = mysqlTable("informacoes", {
  id: int("id").primaryKey().autoincrement(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  conteudo: text("conteudo"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const avisos = mysqlTable("avisos", {
  id: int("id").primaryKey().autoincrement(),
  texto: text("texto"),
  imagemUrl: varchar("imagem_url", { length: 500 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const reviewImages = mysqlTable("review_images", {
  id: int("id").primaryKey().autoincrement(),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  order: int("order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertSiteSettingsSchema = z.object({
  browserTabName: z.string().optional().nullable(),
  mainLogo: z.string().optional().nullable(),
  footerLogo: z.string().optional().nullable(),
  smtpHost: z.string().optional().nullable(),
  smtpPort: z.number().optional().nullable(),
  smtpUser: z.string().optional().nullable(),
  smtpPassword: z.string().optional().nullable(),
  smtpSecure: z.boolean().optional().nullable(),
  solicitacoesEmail: z.string().email("Email inválido").or(z.literal("")).optional().nullable(),
  apiUrl: z.string().url("URL inválida").or(z.literal("")).optional().nullable(),
  apiToken: z.string().optional().nullable(),
  apiPort: z.number().optional().nullable(),
}).partial();

export const insertContactsSchema = z.object({
  whatsapp: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(), // JSON string de array de emails
  address: z.string().optional().nullable(),
  businessHours: z.string().optional().nullable(),
}).partial();

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBannerSchema = createInsertSchema(banners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGallerySchema = createInsertSchema(gallery).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSolicitacaoSchema = createInsertSchema(solicitacoes).omit({
  id: true,
  createdAt: true,
});

export const insertPageSchema = createInsertSchema(pages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
  anexos: true,
}).extend({
  anexos: z.string().optional(),
});

export const insertGoogleSettingsSchema = z.object({
  placeId: z.string().optional().nullable(),
  apiKey: z.string().optional().nullable(),
  reviewsJson: z.string().optional().nullable(),
}).partial();

export const insertScriptsSchema = z.object({
  googleTagManager: z.string().optional().nullable(),
  facebookPixel: z.string().optional().nullable(),
  googleAnalytics: z.string().optional().nullable(),
}).partial();

export const insertSocialMediaSchema = z.object({
  youtube: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  facebook: z.string().optional().nullable(),
  tiktok: z.string().optional().nullable(),
}).partial();

export const insertNewsSchema = createInsertSchema(news).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLinkSchema = createInsertSchema(links).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInformacaoSchema = createInsertSchema(informacoes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAvisoSchema = createInsertSchema(avisos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewImageSchema = createInsertSchema(reviewImages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type Contacts = typeof contacts.$inferSelect;
export type InsertContacts = z.infer<typeof insertContactsSchema>;
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Banner = typeof banners.$inferSelect;
export type InsertBanner = z.infer<typeof insertBannerSchema>;
export type GalleryItem = typeof gallery.$inferSelect;
export type InsertGalleryItem = z.infer<typeof insertGallerySchema>;
export type Solicitacao = typeof solicitacoes.$inferSelect;
export type InsertSolicitacao = z.infer<typeof insertSolicitacaoSchema>;
export type Page = typeof pages.$inferSelect;
export type InsertPage = z.infer<typeof insertPageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type GoogleSettings = typeof googleSettings.$inferSelect;
export type InsertGoogleSettings = z.infer<typeof insertGoogleSettingsSchema>;
export type Scripts = typeof scripts.$inferSelect;
export type InsertScripts = z.infer<typeof insertScriptsSchema>;
export type SocialMedia = typeof socialMedia.$inferSelect;
export type InsertSocialMedia = z.infer<typeof insertSocialMediaSchema>;
export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type Link = typeof links.$inferSelect;
export type InsertLink = z.infer<typeof insertLinkSchema>;
export type Informacao = typeof informacoes.$inferSelect;
export type InsertInformacao = z.infer<typeof insertInformacaoSchema>;
export type Aviso = typeof avisos.$inferSelect;
export type InsertAviso = z.infer<typeof insertAvisoSchema>;
export type ReviewImage = typeof reviewImages.$inferSelect;
export type InsertReviewImage = z.infer<typeof insertReviewImageSchema>;
