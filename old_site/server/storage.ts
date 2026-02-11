import { type User, type InsertUser, users, type SiteSettings, type InsertSiteSettings, siteSettings, type Contacts, type InsertContacts, contacts, type Service, type InsertService, services, type Banner, type InsertBanner, banners, type GalleryItem, type InsertGalleryItem, gallery, type Solicitacao, type InsertSolicitacao, solicitacoes, type Page, type InsertPage, pages, type ContactMessage, type InsertContactMessage, contactMessages, type GoogleSettings, type InsertGoogleSettings, googleSettings, type Scripts, type InsertScripts, scripts, type SocialMedia, type InsertSocialMedia, socialMedia, type News, type InsertNews, news, type Link, type InsertLink, links, type Informacao, type InsertInformacao, informacoes, type Aviso, type InsertAviso, avisos, type ReviewImage, type InsertReviewImage, reviewImages } from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, and, gte, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getSiteSettings(): Promise<SiteSettings | undefined>;
  updateSiteSettings(settings: Partial<InsertSiteSettings>): Promise<SiteSettings>;
  getContacts(): Promise<Contacts | undefined>;
  updateContacts(contactsData: Partial<InsertContacts>): Promise<Contacts>;
  getAllServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;
  getAllBanners(): Promise<Banner[]>;
  getBanner(id: number): Promise<Banner | undefined>;
  createBanner(banner: InsertBanner): Promise<Banner>;
  updateBanner(id: number, banner: Partial<InsertBanner>): Promise<Banner | undefined>;
  deleteBanner(id: number): Promise<boolean>;
  getAllGalleryItems(): Promise<GalleryItem[]>;
  getGalleryItem(id: number): Promise<GalleryItem | undefined>;
  createGalleryItem(item: InsertGalleryItem): Promise<GalleryItem>;
  updateGalleryItem(id: number, item: Partial<InsertGalleryItem>): Promise<GalleryItem | undefined>;
  getAllSolicitacoes(): Promise<Solicitacao[]>;
  getSolicitacaoById(id: number): Promise<Solicitacao | undefined>;
  createSolicitacao(solicitacao: InsertSolicitacao): Promise<Solicitacao>;
  deleteGalleryItem(id: number): Promise<boolean>;
  getAllPages(): Promise<Page[]>;
  getPage(id: number): Promise<Page | undefined>;
  getPageBySlug(slug: string): Promise<Page | undefined>;
  createPage(page: InsertPage): Promise<Page>;
  updatePage(id: number, page: Partial<InsertPage>): Promise<Page | undefined>;
  deletePage(id: number): Promise<boolean>;
  getAllContactMessages(): Promise<ContactMessage[]>;
  getContactMessage(id: number): Promise<ContactMessage | undefined>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  updateContactMessage(id: number, message: Partial<InsertContactMessage>): Promise<ContactMessage | undefined>;
  deleteContactMessage(id: number): Promise<boolean>;
  getGoogleSettings(): Promise<GoogleSettings | undefined>;
  updateGoogleSettings(settings: Partial<InsertGoogleSettings>): Promise<GoogleSettings>;
  getScripts(): Promise<Scripts | undefined>;
  updateScripts(scriptsData: Partial<InsertScripts>): Promise<Scripts>;
  getSocialMedia(): Promise<SocialMedia | undefined>;
  updateSocialMedia(socialMediaData: Partial<InsertSocialMedia>): Promise<SocialMedia>;
  getAllNews(): Promise<News[]>;
  getNews(id: number): Promise<News | undefined>;
  createNews(newsData: InsertNews): Promise<News>;
  updateNews(id: number, newsData: Partial<InsertNews>): Promise<News | undefined>;
  deleteNews(id: number): Promise<boolean>;
  getLinks(): Promise<Link[]>;
  getLink(id: number): Promise<Link | undefined>;
  createLink(linkData: InsertLink): Promise<Link>;
  updateLink(id: number, linkData: Partial<InsertLink>): Promise<Link | undefined>;
  deleteLink(id: number): Promise<boolean>;
  getAllInformacoes(): Promise<Informacao[]>;
  getInformacao(id: number): Promise<Informacao | undefined>;
  createInformacao(informacao: InsertInformacao): Promise<Informacao>;
  updateInformacao(id: number, informacao: Partial<InsertInformacao>): Promise<Informacao | undefined>;
  deleteInformacao(id: number): Promise<boolean>;
  getAllAvisos(): Promise<Aviso[]>;
  getAviso(id: number): Promise<Aviso | undefined>;
  createAviso(aviso: InsertAviso): Promise<Aviso>;
  updateAviso(id: number, aviso: Partial<InsertAviso>): Promise<Aviso | undefined>;
  deleteAviso(id: number): Promise<boolean>;
  getDashboardStats(): Promise<{
    newSolicitacoes: number;
    newDuvidas: number;
    totalSolicitacoes: number;
    totalDuvidas: number;
  }>;
}

export class DbStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser);
    const newUser = await this.getUser(Number(result[0].insertId));
    if (!newUser) {
      throw new Error("Failed to create user");
    }
    return newUser;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    await db.update(users).set(user).where(eq(users.id, id));
    return this.getUser(id);
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result[0].affectedRows > 0;
  }

  async getSiteSettings(): Promise<SiteSettings | undefined> {
    const result = await db.select().from(siteSettings).limit(1);
    return result[0];
  }

  async updateSiteSettings(settings: Partial<InsertSiteSettings>): Promise<SiteSettings> {
    const existing = await this.getSiteSettings();

    if (existing) {
      await db.update(siteSettings).set(settings).where(eq(siteSettings.id, existing.id));
      const updated = await this.getSiteSettings();
      if (!updated) throw new Error("Failed to update site settings");
      return updated;
    } else {
      const result = await db.insert(siteSettings).values(settings);
      const newSettings = await this.getSiteSettings();
      if (!newSettings) throw new Error("Failed to create site settings");
      return newSettings;
    }
  }

  async getContacts(): Promise<Contacts | undefined> {
    const result = await db.select().from(contacts).limit(1);
    return result[0];
  }

  async updateContacts(contactsData: Partial<InsertContacts>): Promise<Contacts> {
    const existing = await this.getContacts();

    if (existing) {
      await db.update(contacts).set(contactsData).where(eq(contacts.id, existing.id));
      const updated = await this.getContacts();
      if (!updated) throw new Error("Failed to update contacts");
      return updated;
    } else {
      const result = await db.insert(contacts).values(contactsData);
      const newContacts = await this.getContacts();
      if (!newContacts) throw new Error("Failed to create contacts");
      return newContacts;
    }
  }

  async getAllServices(): Promise<Service[]> {
    return db.select().from(services);
  }

  async getService(id: number): Promise<Service | undefined> {
    const result = await db.select().from(services).where(eq(services.id, id)).limit(1);
    return result[0];
  }

  async createService(insertService: InsertService): Promise<Service> {
    const result = await db.insert(services).values({
      ...insertService,
      updatedAt: new Date(),
    });
    const newService = await this.getService(Number(result[0].insertId));
    if (!newService) {
      throw new Error("Failed to create service");
    }
    return newService;
  }

  async updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined> {
    await db.update(services).set({
      ...service,
      updatedAt: new Date(),
    }).where(eq(services.id, id));
    return this.getService(id);
  }

  async deleteService(id: number): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id));
    return result[0].affectedRows > 0;
  }

  async getAllBanners(): Promise<Banner[]> {
    return db.select().from(banners);
  }

  async getBanner(id: number): Promise<Banner | undefined> {
    const result = await db.select().from(banners).where(eq(banners.id, id)).limit(1);
    return result[0];
  }

  async createBanner(insertBanner: InsertBanner): Promise<Banner> {
    const result = await db.insert(banners).values({
      ...insertBanner,
      updatedAt: new Date(),
    });
    const newBanner = await this.getBanner(Number(result[0].insertId));
    if (!newBanner) {
      throw new Error("Failed to create banner");
    }
    return newBanner;
  }

  async updateBanner(id: number, banner: Partial<InsertBanner>): Promise<Banner | undefined> {
    await db.update(banners).set({
      ...banner,
      updatedAt: new Date(),
    }).where(eq(banners.id, id));
    return this.getBanner(id);
  }

  async deleteBanner(id: number): Promise<boolean> {
    const result = await db.delete(banners).where(eq(banners.id, id));
    return result[0].affectedRows > 0;
  }

  async getAllGalleryItems(): Promise<GalleryItem[]> {
    return db.select().from(gallery);
  }

  async getGalleryItem(id: number): Promise<GalleryItem | undefined> {
    const result = await db.select().from(gallery).where(eq(gallery.id, id)).limit(1);
    return result[0];
  }

  async createGalleryItem(insertItem: InsertGalleryItem): Promise<GalleryItem> {
    const result = await db.insert(gallery).values({
      ...insertItem,
      updatedAt: new Date(),
    });
    const newItem = await this.getGalleryItem(Number(result[0].insertId));
    if (!newItem) {
      throw new Error("Failed to create gallery item");
    }
    return newItem;
  }

  async updateGalleryItem(id: number, item: Partial<InsertGalleryItem>): Promise<GalleryItem | undefined> {
    await db.update(gallery).set({
      ...item,
      updatedAt: new Date(),
    }).where(eq(gallery.id, id));
    return this.getGalleryItem(id);
  }

  async deleteGalleryItem(id: number): Promise<boolean> {
    const result = await db.delete(gallery).where(eq(gallery.id, id));
    return result[0].affectedRows > 0;
  }

  async getAllSolicitacoes(): Promise<Solicitacao[]> {
    return db.select().from(solicitacoes).orderBy(desc(solicitacoes.createdAt));
  }

  async getSolicitacaoById(id: number): Promise<Solicitacao | undefined> {
    const result = await db.select().from(solicitacoes).where(eq(solicitacoes.id, id)).limit(1);
    return result[0];
  }

  async createSolicitacao(solicitacao: InsertSolicitacao): Promise<Solicitacao> {
    const [newSolicitacao] = await db.insert(solicitacoes).values(solicitacao);
    if (!newSolicitacao.insertId) {
      throw new Error("Failed to create solicitacao");
    }
    const result = await db.select().from(solicitacoes).where(eq(solicitacoes.id, newSolicitacao.insertId));
    if (!result[0]) {
      throw new Error("Failed to retrieve created solicitacao");
    }
    return result[0];
  }

  async getAllPages(): Promise<Page[]> {
    return db.select().from(pages);
  }

  async getPage(id: number): Promise<Page | undefined> {
    const result = await db.select().from(pages).where(eq(pages.id, id)).limit(1);
    return result[0];
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    const result = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);
    return result[0];
  }

  async createPage(insertPage: InsertPage): Promise<Page> {
    const result = await db.insert(pages).values({
      ...insertPage,
      updatedAt: new Date(),
    });
    const newPage = await this.getPage(Number(result[0].insertId));
    if (!newPage) {
      throw new Error("Failed to create page");
    }
    return newPage;
  }

  async updatePage(id: number, page: Partial<InsertPage>): Promise<Page | undefined> {
    await db.update(pages).set({
      ...page,
      updatedAt: new Date(),
    }).where(eq(pages.id, id));
    return this.getPage(id);
  }

  async deletePage(id: number): Promise<boolean> {
    const result = await db.delete(pages).where(eq(pages.id, id));
    return result[0].affectedRows > 0;
  }

  async getAllContactMessages(): Promise<ContactMessage[]> {
    return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    const result = await db.select().from(contactMessages).where(eq(contactMessages.id, id)).limit(1);
    return result[0];
  }

  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const result = await db.insert(contactMessages).values(insertMessage);
    const newMessage = await this.getContactMessage(Number(result[0].insertId));
    if (!newMessage) {
      throw new Error("Failed to create contact message");
    }
    return newMessage;
  }

  async updateContactMessage(id: number, message: Partial<InsertContactMessage>): Promise<ContactMessage | undefined> {
    await db.update(contactMessages).set(message).where(eq(contactMessages.id, id));
    return this.getContactMessage(id);
  }

  async deleteContactMessage(id: number): Promise<boolean> {
    const result = await db.delete(contactMessages).where(eq(contactMessages.id, id));
    return result[0].affectedRows > 0;
  }

  async getGoogleSettings(): Promise<GoogleSettings | undefined> {
    const result = await db.select().from(googleSettings).limit(1);
    return result[0];
  }

  async updateGoogleSettings(settings: Partial<InsertGoogleSettings>): Promise<GoogleSettings> {
    const existing = await this.getGoogleSettings();

    if (existing) {
      await db.update(googleSettings).set(settings).where(eq(googleSettings.id, existing.id));
      const updated = await this.getGoogleSettings();
      if (!updated) throw new Error("Failed to update Google settings");
      return updated;
    } else {
      const result = await db.insert(googleSettings).values(settings);
      const newSettings = await this.getGoogleSettings();
      if (!newSettings) throw new Error("Failed to create Google settings");
      return newSettings;
    }
  }

  async getScripts(): Promise<Scripts | undefined> {
    const result = await db.select().from(scripts).limit(1);
    return result[0];
  }

  async updateScripts(scriptsData: Partial<InsertScripts>): Promise<Scripts> {
    const existing = await this.getScripts();

    if (existing) {
      await db.update(scripts).set(scriptsData).where(eq(scripts.id, existing.id));
      const updated = await this.getScripts();
      if (!updated) throw new Error("Failed to update scripts");
      return updated;
    } else {
      const result = await db.insert(scripts).values(scriptsData);
      const newScripts = await this.getScripts();
      if (!newScripts) throw new Error("Failed to create scripts");
      return newScripts;
    }
  }

  async getSocialMedia(): Promise<SocialMedia | undefined> {
    const result = await db.select().from(socialMedia).limit(1);
    return result[0];
  }

  async updateSocialMedia(socialMediaData: Partial<InsertSocialMedia>): Promise<SocialMedia> {
    const existing = await this.getSocialMedia();

    if (existing) {
      await db.update(socialMedia).set(socialMediaData).where(eq(socialMedia.id, existing.id));
      const updated = await this.getSocialMedia();
      if (!updated) throw new Error("Failed to update social media");
      return updated;
    } else {
      const result = await db.insert(socialMedia).values(socialMediaData);
      const newSocialMedia = await this.getSocialMedia();
      if (!newSocialMedia) throw new Error("Failed to create social media");
      return newSocialMedia;
    }
  }

  async getAllNews(): Promise<News[]> {
    return db.select().from(news).orderBy(desc(news.createdAt));
  }

  async getNews(id: number): Promise<News | undefined> {
    const result = await db.select().from(news).where(eq(news.id, id)).limit(1);
    return result[0];
  }

  async createNews(insertNews: InsertNews): Promise<News> {
    const result = await db.insert(news).values({
      ...insertNews,
      updatedAt: new Date(),
    });
    const newNews = await this.getNews(Number(result[0].insertId));
    if (!newNews) {
      throw new Error("Failed to create news");
    }
    return newNews;
  }

  async updateNews(id: number, newsData: Partial<InsertNews>): Promise<News | undefined> {
    await db.update(news).set({
      ...newsData,
      updatedAt: new Date(),
    }).where(eq(news.id, id));
    return this.getNews(id);
  }

  async deleteNews(id: number): Promise<boolean> {
    const result = await db.delete(news).where(eq(news.id, id));
    return result[0].affectedRows > 0;
  }

  async getLinks(): Promise<Link[]> {
    const result = await db.select().from(links).orderBy(links.order);
    return result;
  }

  async getLink(id: number): Promise<Link | undefined> {
    const result = await db.select().from(links).where(eq(links.id, id)).limit(1);
    return result[0];
  }

  async createLink(linkData: InsertLink): Promise<Link> {
    const result = await db.insert(links).values(linkData);
    return this.getLink(Number(result[0].insertId)) as Promise<Link>;
  }

  async updateLink(id: number, linkData: Partial<InsertLink>): Promise<Link | undefined> {
    await db.update(links).set({
      ...linkData,
      updatedAt: new Date(),
    }).where(eq(links.id, id));
    return this.getLink(id);
  }

  async deleteLink(id: number): Promise<boolean> {
    const result = await db.delete(links).where(eq(links.id, id));
    return result[0].affectedRows > 0;
  }

  async getAllInformacoes(): Promise<Informacao[]> {
    return db.select().from(informacoes).orderBy(desc(informacoes.createdAt));
  }

  async getInformacao(id: number): Promise<Informacao | undefined> {
    const result = await db.select().from(informacoes).where(eq(informacoes.id, id)).limit(1);
    return result[0];
  }

  async createInformacao(informacao: InsertInformacao): Promise<Informacao> {
    const [newInformacao] = await db.insert(informacoes).values(informacao);
    if (!newInformacao.insertId) {
      throw new Error("Failed to create informacao");
    }
    const result = await db.select().from(informacoes).where(eq(informacoes.id, newInformacao.insertId));
    if (!result[0]) {
      throw new Error("Failed to retrieve created informacao");
    }
    return result[0];
  }

  async updateInformacao(id: number, informacao: Partial<InsertInformacao>): Promise<Informacao | undefined> {
    await db.update(informacoes).set({
      ...informacao,
      updatedAt: new Date(),
    }).where(eq(informacoes.id, id));
    return this.getInformacao(id);
  }

  async deleteInformacao(id: number): Promise<boolean> {
    const result = await db.delete(informacoes).where(eq(informacoes.id, id));
    return result[0].affectedRows > 0;
  }

  async getAllAvisos(): Promise<Aviso[]> {
    return db.select().from(avisos).orderBy(desc(avisos.createdAt));
  }

  async getAviso(id: number): Promise<Aviso | undefined> {
    const result = await db.select().from(avisos).where(eq(avisos.id, id)).limit(1);
    return result[0];
  }

  async createAviso(aviso: InsertAviso): Promise<Aviso> {
    const [newAviso] = await db.insert(avisos).values(aviso);
    if (!newAviso.insertId) {
      throw new Error("Failed to create aviso");
    }
    const result = await db.select().from(avisos).where(eq(avisos.id, newAviso.insertId));
    if (!result[0]) {
      throw new Error("Failed to retrieve created aviso");
    }
    return result[0];
  }

  async updateAviso(id: number, aviso: Partial<InsertAviso>): Promise<Aviso | undefined> {
    await db.update(avisos).set({
      ...aviso,
      updatedAt: new Date(),
    }).where(eq(avisos.id, id));
    return this.getAviso(id);
  }

  async deleteAviso(id: number): Promise<boolean> {
    const result = await db.delete(avisos).where(eq(avisos.id, id));
    return result[0].affectedRows > 0;
  }

  // Review Images methods
  async getAllReviewImages(): Promise<ReviewImage[]> {
    return db.select().from(reviewImages).orderBy(reviewImages.order, desc(reviewImages.createdAt));
  }

  async getReviewImage(id: number): Promise<ReviewImage | undefined> {
    const result = await db.select().from(reviewImages).where(eq(reviewImages.id, id)).limit(1);
    return result[0];
  }

  async createReviewImage(reviewImage: InsertReviewImage): Promise<ReviewImage> {
    const [newReviewImage] = await db.insert(reviewImages).values(reviewImage);
    if (!newReviewImage.insertId) {
      throw new Error("Failed to create review image");
    }
    const result = await db.select().from(reviewImages).where(eq(reviewImages.id, newReviewImage.insertId));
    if (!result[0]) {
      throw new Error("Failed to retrieve created review image");
    }
    return result[0];
  }

  async updateReviewImage(id: number, reviewImage: Partial<InsertReviewImage>): Promise<ReviewImage | undefined> {
    await db.update(reviewImages).set({
      ...reviewImage,
      updatedAt: new Date(),
    }).where(eq(reviewImages.id, id));
    return this.getReviewImage(id);
  }

  async deleteReviewImage(id: number): Promise<boolean> {
    const result = await db.delete(reviewImages).where(eq(reviewImages.id, id));
    return result[0].affectedRows > 0;
  }

  async getDashboardStats(): Promise<{
    newSolicitacoes: number;
    newDuvidas: number;
    totalSolicitacoes: number;
    totalDuvidas: number;
  }> {
    // Calcular data de 7 dias atrás
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Contar total de solicitações
    const totalSolicitacoesResult = await db
      .select({ count: count() })
      .from(solicitacoes);
    const totalSolicitacoes = totalSolicitacoesResult[0]?.count || 0;

    // Contar solicitações novas (últimos 7 dias)
    const newSolicitacoesResult = await db
      .select({ count: count() })
      .from(solicitacoes)
      .where(gte(solicitacoes.createdAt, sevenDaysAgo));
    const newSolicitacoes = newSolicitacoesResult[0]?.count || 0;

    // Contar total de dúvidas (mensagens de contato)
    const totalDuvidasResult = await db
      .select({ count: count() })
      .from(contactMessages);
    const totalDuvidas = totalDuvidasResult[0]?.count || 0;

    // Contar dúvidas novas (últimos 7 dias)
    const newDuvidasResult = await db
      .select({ count: count() })
      .from(contactMessages)
      .where(gte(contactMessages.createdAt, sevenDaysAgo));
    const newDuvidas = newDuvidasResult[0]?.count || 0;

    return {
      newSolicitacoes,
      newDuvidas,
      totalSolicitacoes,
      totalDuvidas,
    };
  }
}

export const storage = new DbStorage();
