import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import passport from "./auth";
import bcrypt from "bcryptjs";
import { insertUserSchema, type User, insertSiteSettingsSchema, insertContactsSchema, insertServiceSchema, type Service, insertBannerSchema, type Banner, insertGallerySchema, type GalleryItem, insertPageSchema, type Page, insertContactMessageSchema, type ContactMessage, insertGoogleSettingsSchema, insertScriptsSchema, insertSocialMediaSchema, insertNewsSchema, type News, insertLinkSchema, type Link, insertInformacaoSchema, type Informacao, insertAvisoSchema, type Aviso, insertReviewImageSchema, type ReviewImage } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { sendEmail, formatContactEmailHtml, formatSolicitacaoEmailHtml } from "./emailService";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Apenas imagens são permitidas"));
    }
  },
});

// Upload for documents (PDF only)
const uploadDocuments = multer({
  storage: uploadStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const isPdf = file.mimetype === 'application/pdf';
    if (isPdf) {
      cb(null, true);
    } else {
      cb(new Error("Apenas arquivos PDF são permitidos"));
    }
  },
});

// Upload for contact attachments (images and PDFs, max 5 files)
const uploadContactAttachments = multer({
  storage: uploadStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    const mimetypeValid = allowedMimeTypes.includes(file.mimetype);
    if (extname && mimetypeValid) {
      cb(null, true);
    } else {
      cb(new Error("Apenas imagens (JPG, PNG, GIF) e PDFs são permitidos"));
    }
  },
});

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      password: string;
      fullName: string;
      email: string;
      isAdmin: boolean;
      createdAt: Date;
    }
  }
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Não autenticado" });
  }
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Não autenticado" });
  }
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Acesso negado. Apenas administradores." });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: User, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Login falhou" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        const { password, ...userWithoutPassword } = user;
        return res.json({ user: userWithoutPassword });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      res.json({ message: "Logout realizado com sucesso" });
    });
  });

  app.get("/api/auth/me", requireAuth, (req, res) => {
    const { password, ...userWithoutPassword } = req.user!;
    res.json({ user: userWithoutPassword });
  });

  // User management routes (admin only)
  app.get("/api/users", requireAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const usersWithoutPassword = allUsers.map(({ password, ...user }) => user);
      res.json({ users: usersWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar usuários" });
    }
  });

  app.post("/api/users", requireAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Nome de usuário já existe" });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email já está em uso" });
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar usuário" });
    }
  });

  app.put("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;

      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      const updatedUser = await storage.updateUser(id, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const { password, ...userWithoutPassword } = updatedUser;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar usuário" });
    }
  });

  app.delete("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      if (req.user!.id === id) {
        return res.status(400).json({ message: "Você não pode deletar sua própria conta" });
      }

      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      res.json({ message: "Usuário deletado com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar usuário" });
    }
  });

  // Site settings routes
  app.get("/api/site-settings", async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json({ settings: settings || {} });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar configurações" });
    }
  });

  app.post("/api/upload/logo", requireAdmin, upload.single("logo"), async (req, res) => {
    try {
      console.log("Upload request received");
      console.log("File:", req.file);

      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado" });
      }

      const filePath = `/uploads/${req.file.filename}`;
      console.log("File saved to:", filePath);
      res.json({ filePath });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ message: error.message || "Erro ao fazer upload" });
    }
  });

  app.put("/api/site-settings", requireAdmin, async (req, res) => {
    try {
      const settingsData = insertSiteSettingsSchema.parse(req.body);
      const updatedSettings = await storage.updateSiteSettings(settingsData);
      res.json({ settings: updatedSettings });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error("Erro ao atualizar configurações:", error);
      res.status(500).json({ message: "Erro ao atualizar configurações" });
    }
  });

  // Contacts routes
  app.get("/api/contacts", async (req, res) => {
    try {
      const contactsData = await storage.getContacts();
      res.json({ contacts: contactsData || {} });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar contatos" });
    }
  });

  app.put("/api/contacts", requireAdmin, async (req, res) => {
    try {
      const contactsData = insertContactsSchema.parse(req.body);
      const updatedContacts = await storage.updateContacts(contactsData);
      res.json({ contacts: updatedContacts });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error("Erro ao atualizar contatos:", error);
      res.status(500).json({ message: "Erro ao atualizar contatos" });
    }
  });

  // Google Settings routes
  app.get("/api/google-settings", async (req, res) => {
    try {
      const googleSettings = await storage.getGoogleSettings();
      res.json({ googleSettings: googleSettings || {} });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar configurações do Google" });
    }
  });

  app.put("/api/google-settings", requireAdmin, async (req, res) => {
    try {
      const googleSettingsData = insertGoogleSettingsSchema.parse(req.body);
      const updatedSettings = await storage.updateGoogleSettings(googleSettingsData);
      res.json({ googleSettings: updatedSettings });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error("Erro ao atualizar configurações do Google:", error);
      res.status(500).json({ message: "Erro ao atualizar configurações do Google" });
    }
  });

  // Scripts routes
  app.get("/api/scripts", async (req, res) => {
    try {
      const scriptsData = await storage.getScripts();
      res.json({ scripts: scriptsData || {} });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar scripts" });
    }
  });

  app.put("/api/scripts", requireAdmin, async (req, res) => {
    try {
      const scriptsData = insertScriptsSchema.parse(req.body);
      const updatedScripts = await storage.updateScripts(scriptsData);
      res.json({ scripts: updatedScripts });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error("Erro ao atualizar scripts:", error);
      res.status(500).json({ message: "Erro ao atualizar scripts" });
    }
  });

  // Social Media routes
  app.get("/api/social-media", async (req, res) => {
    try {
      const socialMediaData = await storage.getSocialMedia();
      res.json({ socialMedia: socialMediaData || {} });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar redes sociais" });
    }
  });

  app.put("/api/social-media", requireAdmin, async (req, res) => {
    try {
      const socialMediaData = insertSocialMediaSchema.parse(req.body);
      const updatedSocialMedia = await storage.updateSocialMedia(socialMediaData);
      res.json({ socialMedia: updatedSocialMedia });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error("Erro ao atualizar redes sociais:", error);
      res.status(500).json({ message: "Erro ao atualizar redes sociais" });
    }
  });

  // Services routes
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json({ services });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar serviços" });
    }
  });

  app.post("/api/services", requireAdmin, async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const newService = await storage.createService(serviceData);
      res.status(201).json({ service: newService });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar serviço" });
    }
  });

  app.put("/api/services/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const serviceData = insertServiceSchema.parse(req.body);
      const updatedService = await storage.updateService(id, serviceData);

      if (!updatedService) {
        return res.status(404).json({ message: "Serviço não encontrado" });
      }

      res.json({ service: updatedService });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar serviço" });
    }
  });

  app.delete("/api/services/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteService(id);

      if (!deleted) {
        return res.status(404).json({ message: "Serviço não encontrado" });
      }

      res.json({ message: "Serviço deletado com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar serviço" });
    }
  });

  // Banners routes
  app.get("/api/banners", async (req, res) => {
    try {
      const banners = await storage.getAllBanners();
      res.json({ banners });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar banners" });
    }
  });

  app.post("/api/upload/banner", requireAdmin, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhuma imagem enviada" });
      }

      const filePath = `/uploads/${req.file.filename}`;
      res.json({ filePath });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ message: error.message || "Erro ao fazer upload" });
    }
  });

  app.post("/api/banners", requireAdmin, async (req, res) => {
    try {
      const bannerData = insertBannerSchema.parse(req.body);
      const newBanner = await storage.createBanner(bannerData);
      res.status(201).json({ banner: newBanner });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar banner" });
    }
  });

  app.put("/api/banners/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const bannerData = insertBannerSchema.parse(req.body);
      const updatedBanner = await storage.updateBanner(id, bannerData);

      if (!updatedBanner) {
        return res.status(404).json({ message: "Banner não encontrado" });
      }

      res.json({ banner: updatedBanner });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar banner" });
    }
  });

  app.patch("/api/banners/:id/toggle", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { active } = req.body;

      const updatedBanner = await storage.updateBanner(id, { active });

      if (!updatedBanner) {
        return res.status(404).json({ message: "Banner não encontrado" });
      }

      res.json({ banner: updatedBanner });
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar status do banner" });
    }
  });

  app.delete("/api/banners/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteBanner(id);

      if (!deleted) {
        return res.status(404).json({ message: "Banner não encontrado" });
      }

      res.json({ message: "Banner deletado com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar banner" });
    }
  });

  // Gallery routes
  app.get("/api/gallery", async (req, res) => {
    try {
      const gallery = await storage.getAllGalleryItems();
      res.json({ gallery });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar galeria" });
    }
  });

  app.post("/api/upload/gallery", requireAdmin, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhuma imagem enviada" });
      }

      const filePath = `/uploads/${req.file.filename}`;
      res.json({ filePath });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ message: error.message || "Erro ao fazer upload" });
    }
  });

  app.post("/api/gallery", requireAdmin, async (req, res) => {
    try {
      const galleryData = insertGallerySchema.parse(req.body);
      const newItem = await storage.createGalleryItem(galleryData);
      res.status(201).json({ item: newItem });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar item da galeria" });
    }
  });

  app.put("/api/gallery/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const galleryData = insertGallerySchema.parse(req.body);
      const updatedItem = await storage.updateGalleryItem(id, galleryData);

      if (!updatedItem) {
        return res.status(404).json({ message: "Item não encontrado" });
      }

      res.json({ item: updatedItem });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar item da galeria" });
    }
  });

  app.patch("/api/gallery/:id/toggle", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { active } = req.body;

      const updatedItem = await storage.updateGalleryItem(id, { active });

      if (!updatedItem) {
        return res.status(404).json({ message: "Item não encontrado" });
      }

      res.json({ item: updatedItem });
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar status do item" });
    }
  });

  app.delete("/api/gallery/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteGalleryItem(id);

      if (!deleted) {
        return res.status(404).json({ message: "Item não encontrado" });
      }

      res.json({ message: "Item da galeria deletado com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar item da galeria" });
    }
  });

  // Solicitações routes
  app.get("/api/solicitacoes", requireAdmin, async (req, res) => {
    try {
      const solicitacoes = await storage.getAllSolicitacoes();
      res.json({ solicitacoes });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar solicitações" });
    }
  });

  app.get("/api/solicitacoes/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const solicitacao = await storage.getSolicitacaoById(id);

      if (!solicitacao) {
        return res.status(404).json({ message: "Solicitação não encontrada" });
      }

      res.json({ solicitacao });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar solicitação" });
    }
  });

  // Rota para solicitações sem upload (JSON)
  app.post("/api/solicitacoes", async (req, res) => {
    // Verifica se é JSON (não tem multipart)
    const contentType = req.headers['content-type'] || '';

    if (contentType.includes('application/json')) {
      try {
        const dadosFormulario: any = { ...req.body };

        // Extrair tipo e nome da solicitação do corpo da requisição
        const tipoSolicitacao = dadosFormulario.tipoSolicitacao || "certidao-de-escritura";
        const nomeSolicitacao = dadosFormulario.nomeSolicitacao || "Certidão de Escritura";

        // Remover campos de controle do dadosFormulario
        delete dadosFormulario.tipoSolicitacao;
        delete dadosFormulario.nomeSolicitacao;

        await storage.createSolicitacao({
          tipoSolicitacao,
          nomeSolicitacao,
          dadosFormulario: JSON.stringify(dadosFormulario)
        });

        console.log('💾 Solicitação salva no banco');

        // Tentar enviar email
        try {
          const settings = await storage.getSiteSettings();

          if (settings?.solicitacoesEmail) {
            console.log('📧 Enviando email de solicitação para:', settings.solicitacoesEmail);

            await sendEmail(settings, {
              to: settings.solicitacoesEmail,
              subject: `Nova Solicitação: ${nomeSolicitacao}`,
              html: formatSolicitacaoEmailHtml({
                tipoSolicitacao,
                nomeSolicitacao,
                dadosFormulario
              })
            });

            console.log('✅ Email de solicitação enviado com sucesso!');
          } else {
            console.log('⚠️ Email de solicitações não configurado');
          }
        } catch (emailError) {
          console.error('❌ Erro ao enviar email de solicitação:', emailError);
          // Não falha a requisição se o email não for enviado
        }

        res.json({ message: "Solicitação enviada com sucesso, aguarde nosso contato." });
      } catch (error) {
        console.error("Erro ao criar solicitação:", error);
        res.status(500).json({ message: "Erro ao enviar solicitação" });
      }
    } else {
      // Se não for JSON, passa para o próximo middleware (multer)
      return uploadDocuments.fields([
        { name: 'documentosVendedores', maxCount: 5 },
        { name: 'documentosPessoasFisicasVendedores', maxCount: 5 },
        { name: 'documentosCompradores', maxCount: 5 },
        { name: 'documentosPessoasFisicasCompradores', maxCount: 5 },
        { name: 'documentosImoveis', maxCount: 5 }
      ])(req, res, async (err) => {
        if (err) {
          console.error("Erro no upload:", err);
          return res.status(500).json({ message: err.message || "Erro ao fazer upload" });
        }

        try {
          const files = req.files as { [fieldname: string]: Express.Multer.File[] };
          const dadosFormulario: any = { ...req.body };

          // Extrair tipo e nome da solicitação do corpo da requisição
          const tipoSolicitacao = dadosFormulario.tipoSolicitacao || "certidao-de-escritura";
          const nomeSolicitacao = dadosFormulario.nomeSolicitacao || "Certidão de Escritura";

          // Remover campos de controle do dadosFormulario
          delete dadosFormulario.tipoSolicitacao;
          delete dadosFormulario.nomeSolicitacao;

          // Adicionar caminhos dos arquivos ao dados do formulário (múltiplos arquivos)
          if (files) {
            Object.keys(files).forEach(fieldName => {
              if (files[fieldName] && files[fieldName].length > 0) {
                // Salvar array de caminhos de arquivos
                dadosFormulario[fieldName] = files[fieldName].map(file => `/uploads/${file.filename}`);
              }
            });
          }

          await storage.createSolicitacao({
            tipoSolicitacao,
            nomeSolicitacao,
            dadosFormulario: JSON.stringify(dadosFormulario)
          });

          console.log('💾 Solicitação com arquivos salva no banco');

          // Tentar enviar email
          try {
            const settings = await storage.getSiteSettings();

            if (settings?.solicitacoesEmail) {
              console.log('📧 Enviando email de solicitação com anexos para:', settings.solicitacoesEmail);

              await sendEmail(settings, {
                to: settings.solicitacoesEmail,
                subject: `Nova Solicitação: ${nomeSolicitacao}`,
                html: formatSolicitacaoEmailHtml({
                  tipoSolicitacao,
                  nomeSolicitacao,
                  dadosFormulario
                })
              });

              console.log('✅ Email de solicitação enviado com sucesso!');
            } else {
              console.log('⚠️ Email de solicitações não configurado');
            }
          } catch (emailError) {
            console.error('❌ Erro ao enviar email de solicitação:', emailError);
            // Não falha a requisição se o email não for enviado
          }

          res.json({ message: "Solicitação enviada com sucesso, aguarde nosso contato." });
        } catch (error) {
          console.error("Erro ao criar solicitação:", error);
          res.status(500).json({ message: "Erro ao enviar solicitação" });
        }
      });
    }
  });

  // Pages routes
  app.get("/api/pages", async (req, res) => {
    try {
      const pages = await storage.getAllPages();
      res.json({ pages });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar páginas" });
    }
  });

  app.get("/api/pages/:slug", async (req, res) => {
    try {
      const page = await storage.getPageBySlug(req.params.slug);
      if (!page) {
        return res.status(404).json({ message: "Página não encontrada" });
      }
      res.json({ page });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar página" });
    }
  });

  app.post("/api/pages", requireAdmin, async (req, res) => {
    try {
      console.log('Recebendo dados para criar página:', req.body);
      const pageData = insertPageSchema.parse(req.body);
      console.log('Dados validados:', pageData);
      const newPage = await storage.createPage(pageData);
      console.log('Página criada:', newPage);
      res.status(201).json({ page: newPage });
    } catch (error) {
      console.error('Erro ao criar página:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar página" });
    }
  });

  app.put("/api/pages/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pageData = insertPageSchema.parse(req.body);
      const updatedPage = await storage.updatePage(id, pageData);

      if (!updatedPage) {
        return res.status(404).json({ message: "Página não encontrada" });
      }

      res.json({ page: updatedPage });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar página" });
    }
  });

  app.patch("/api/pages/:id/toggle", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { active } = req.body;

      const updatedPage = await storage.updatePage(id, { active });

      if (!updatedPage) {
        return res.status(404).json({ message: "Página não encontrada" });
      }

      res.json({ page: updatedPage });
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar status da página" });
    }
  });

  app.delete("/api/pages/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePage(id);

      if (!deleted) {
        return res.status(404).json({ message: "Página não encontrada" });
      }

      res.json({ message: "Página deletada com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar página" });
    }
  });

  // Contact Messages routes
  app.get("/api/contact-messages", requireAdmin, async (req, res) => {
    try {
      const messages = await storage.getAllContactMessages();
      res.json({ messages });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar mensagens de contato" });
    }
  });

  app.post("/api/contact-messages", uploadContactAttachments.array('anexos', 5), async (req, res) => {
    try {
      console.log('📨 Recebendo mensagem de contato:', req.body);
      console.log('📎 Arquivos anexados:', req.files);

      // Convert lido string to boolean if it comes from FormData
      const bodyData = {
        ...req.body,
        lido: req.body.lido === 'true' || req.body.lido === true
      };

      const messageData = insertContactMessageSchema.parse(bodyData);

      // Process uploaded files
      const files = req.files as Express.Multer.File[] | undefined;
      let anexos: string[] = [];

      if (files && files.length > 0) {
        anexos = files.map(file => `/uploads/${file.filename}`);
      }

      console.log('✅ Dados validados:', messageData);
      console.log('📁 Anexos salvos:', anexos);

      const newMessage = await storage.createContactMessage({
        ...messageData,
        anexos: anexos.length > 0 ? JSON.stringify(anexos) : undefined
      });

      console.log('💾 Mensagem salva no banco:', newMessage);

      // Tentar enviar email
      try {
        const settings = await storage.getSiteSettings();

        if (settings?.solicitacoesEmail) {
          console.log('📧 Enviando email para:', settings.solicitacoesEmail);

          const emailHtml = formatContactEmailHtml({
            nome: messageData.nome,
            email: messageData.email,
            telefone: messageData.telefone,
            mensagem: messageData.mensagem,
            anexos: anexos.length > 0 ? anexos : undefined
          });

          console.log('📧 Anexos sendo enviados no email:', anexos);

          await sendEmail(settings, {
            to: settings.solicitacoesEmail,
            subject: `Nova mensagem de contato - ${messageData.nome}`,
            html: emailHtml
          });

          console.log('✅ Email enviado com sucesso!');
        } else {
          console.log('⚠️ Email de solicitações não configurado');
        }
      } catch (emailError) {
        console.error('❌ Erro ao enviar email:', emailError);
        // Não falha a requisição se o email não for enviado
        // A mensagem já foi salva no banco
      }

      res.status(201).json({ message: newMessage });
    } catch (error) {
      console.error('❌ Erro ao criar mensagem de contato:', error);
      if (error instanceof z.ZodError) {
        console.error('Erros de validação:', error.errors);
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar mensagem de contato" });
    }
  });

  app.patch("/api/contact-messages/:id/toggle-read", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { lido } = req.body;

      const updatedMessage = await storage.updateContactMessage(id, { lido });

      if (!updatedMessage) {
        return res.status(404).json({ message: "Mensagem não encontrada" });
      }

      res.json({ message: updatedMessage });
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar status da mensagem" });
    }
  });

  app.delete("/api/contact-messages/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteContactMessage(id);

      if (!deleted) {
        return res.status(404).json({ message: "Mensagem não encontrada" });
      }

      res.json({ message: "Mensagem deletada com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar mensagem" });
    }
  });

  // News routes
  app.get("/api/news", async (req, res) => {
    try {
      const allNews = await storage.getAllNews();
      res.json({ news: allNews });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar notícias" });
    }
  });

  app.post("/api/upload/news", requireAdmin, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhuma imagem enviada" });
      }

      const filePath = `/uploads/${req.file.filename}`;
      res.json({ filePath });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ message: error.message || "Erro ao fazer upload" });
    }
  });

  app.post("/api/news", requireAdmin, async (req, res) => {
    try {
      const newsData = insertNewsSchema.parse(req.body);
      const newNews = await storage.createNews(newsData);
      res.status(201).json({ news: newNews });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar notícia" });
    }
  });

  app.put("/api/news/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const newsData = insertNewsSchema.parse(req.body);
      const updatedNews = await storage.updateNews(id, newsData);

      if (!updatedNews) {
        return res.status(404).json({ message: "Notícia não encontrada" });
      }

      res.json({ news: updatedNews });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar notícia" });
    }
  });

  app.patch("/api/news/:id/toggle", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { active } = req.body;

      const updatedNews = await storage.updateNews(id, { active });

      if (!updatedNews) {
        return res.status(404).json({ message: "Notícia não encontrada" });
      }

      res.json({ news: updatedNews });
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar status da notícia" });
    }
  });

  app.delete("/api/news/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteNews(id);

      if (!deleted) {
        return res.status(404).json({ message: "Notícia não encontrada" });
      }

      res.json({ message: "Notícia deletada com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar notícia" });
    }
  });

  // Links routes
  app.get("/api/links", async (req, res) => {
    try {
      const links = await storage.getLinks();
      res.json({ links });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar links" });
    }
  });

  app.post("/api/links", requireAdmin, async (req, res) => {
    try {
      const linkData = insertLinkSchema.parse(req.body);
      const newLink = await storage.createLink(linkData);
      res.json({ link: newLink });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar link" });
    }
  });

  app.put("/api/links/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const linkData = insertLinkSchema.partial().parse(req.body);
      const updatedLink = await storage.updateLink(id, linkData);

      if (!updatedLink) {
        return res.status(404).json({ message: "Link não encontrado" });
      }

      res.json({ link: updatedLink });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar link" });
    }
  });

  app.patch("/api/links/:id/toggle", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { active } = req.body;

      const updatedLink = await storage.updateLink(id, { active });

      if (!updatedLink) {
        return res.status(404).json({ message: "Link não encontrado" });
      }

      res.json({ link: updatedLink });
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar status do link" });
    }
  });

  app.delete("/api/links/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteLink(id);

      if (!deleted) {
        return res.status(404).json({ message: "Link não encontrado" });
      }

      res.json({ message: "Link deletado com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar link" });
    }
  });

  // Test email route
  app.post("/api/test-email", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();

      if (!settings?.solicitacoesEmail) {
        return res.status(400).json({
          message: "Email de solicitações não configurado. Configure em Configurações do Site."
        });
      }

      if (!settings.smtpHost || !settings.smtpPort || !settings.smtpUser || !settings.smtpPassword) {
        return res.status(400).json({
          message: "Configurações SMTP incompletas. Configure em Configurações do Site."
        });
      }

      console.log('🧪 Testando envio de email...');

      await sendEmail(settings, {
        to: settings.solicitacoesEmail,
        subject: 'Teste de Email - Cartório',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
          </head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #1e3a8a;">✅ Email de Teste</h2>
            <p>Se você recebeu este email, as configurações SMTP estão funcionando corretamente!</p>
            <p><strong>Configurações utilizadas:</strong></p>
            <ul>
              <li>Host: ${settings.smtpHost}</li>
              <li>Porta: ${settings.smtpPort}</li>
              <li>Usuário: ${settings.smtpUser}</li>
            </ul>
          </body>
          </html>
        `
      });

      res.json({
        message: "Email de teste enviado com sucesso! Verifique a caixa de entrada.",
        emailDestino: settings.solicitacoesEmail
      });
    } catch (error: any) {
      console.error('❌ Erro ao enviar email de teste:', error);
      res.status(500).json({
        message: "Erro ao enviar email de teste",
        error: error.message,
        details: "Verifique se a senha SMTP é uma Senha de App do Google e se a opção 'Conexão Segura' está DESMARCADA para porta 587."
      });
    }
  });

  // Consulta processo route
  app.post("/api/consulta-processo", async (req, res) => {
    try {
      const { numeroProcesso, cpf } = req.body;

      if (!numeroProcesso || !cpf) {
        return res.status(400).json({
          message: "Número do processo e CPF são obrigatórios"
        });
      }

      // Buscar configurações da API do banco de dados
      const settings = await storage.getSiteSettings();

      if (!settings?.apiUrl || !settings?.apiToken || !settings?.apiPort) {
        return res.status(500).json({
          message: "Configurações da API não encontradas. Configure em Configurações do Site."
        });
      }

      // Montar a URL da API externa
      let apiUrl = settings.apiUrl.replace(/\/$/, ''); // Remove barra final se houver

      // Se não tem protocolo, adicionar http por padrão
      if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
        apiUrl = `http://${apiUrl}`;
      }

      const fullUrl = `${apiUrl}:${settings.apiPort}/marcha?num_seq=${numeroProcesso}&identificacao=${cpf}`;

      console.log('🔍 Consultando processo na API externa:', fullUrl);
      console.log('📡 Configurações:', {
        url: settings.apiUrl,
        port: settings.apiPort,
        hasToken: !!settings.apiToken
      });

      // Criar timeout de 15 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        // Fazer a requisição para a API externa
        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${settings.apiToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          console.error('❌ Erro na consulta:', response.status, response.statusText);

          if (response.status === 404) {
            return res.status(404).json({
              message: "Processo não encontrado. Verifique o número do processo e CPF."
            });
          }

          if (response.status === 401) {
            return res.status(401).json({
              message: "Token de autenticação inválido. Verifique as configurações da API."
            });
          }

          return res.status(response.status).json({
            message: `Erro ao consultar processo. Status: ${response.status}`
          });
        }

        // Verificar o content-type antes de tentar fazer parse JSON
        const contentType = response.headers.get('content-type');

        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('❌ API retornou HTML ao invés de JSON');
          console.error('📄 Primeiros 500 caracteres:', text.substring(0, 500));

          return res.status(502).json({
            message: "A API externa retornou uma resposta inválida (HTML ao invés de JSON). Verifique as configurações."
          });
        }

        const data = await response.json();
        console.log('✅ Processo encontrado!');
        console.log('📋 Dados do processo:', JSON.stringify(data, null, 2));

        // Se a resposta for um array, pegar o primeiro item e garantir que tem partes e andamentos
        let processoData = Array.isArray(data) ? data[0] : data;

        // Log das partes e andamentos para debug
        if (processoData) {
          if (processoData.partes) {
            console.log(`👥 ${processoData.partes.length} partes encontradas`);
          }
          if (processoData.andamentos) {
            console.log(`📝 ${processoData.andamentos.length} andamentos encontrados`);
          }
        }

        res.json(data);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);

        if (fetchError.name === 'AbortError') {
          console.error('⏱️ Timeout na consulta à API externa');
          return res.status(504).json({
            message: "Tempo limite excedido. A API externa demorou muito para responder."
          });
        }

        // Re-throw para ser capturado pelo catch externo
        throw fetchError;
      }
    } catch (error: any) {
      console.error('❌ Erro ao consultar processo:', error);
      console.error('🔍 URL tentada:', fullUrl);
      console.error('📊 Tipo do erro:', error.code || error.name);

      // Tratamento específico para erro de conexão recusada
      if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
        return res.status(503).json({
          message: "Não foi possível conectar à API externa. O serviço pode estar temporariamente indisponível. Tente novamente em alguns instantes."
        });
      }

      // Tratamento para erro de DNS
      if (error.code === 'ENOTFOUND' || error.message?.includes('ENOTFOUND')) {
        return res.status(503).json({
          message: "Não foi possível localizar o servidor da API. Verifique as configurações da URL."
        });
      }

      // Erro genérico
      res.status(500).json({
        message: "Erro ao processar a consulta. Por favor, tente novamente.",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Teste de conexão com API externa
  app.post("/api/test-api-connection", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();

      if (!settings?.apiUrl || !settings?.apiToken || !settings?.apiPort) {
        return res.status(400).json({
          message: "Configure a URL, Token e Porta da API antes de testar."
        });
      }

      // Montar a URL da API externa
      let apiUrl = settings.apiUrl.replace(/\/$/, '');

      // Se não tem protocolo, adicionar http por padrão
      if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
        apiUrl = `http://${apiUrl}`;
      }

      // Teste simples de conexão - usar um número de processo de teste
      const testUrl = `${apiUrl}:${settings.apiPort}/marcha?num_seq=12345&identificacao=00000000000`;

      console.log('🧪 Testando conexão com API:', testUrl);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(testUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${settings.apiToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log('📊 Resposta do teste:', response.status);

        if (response.status === 401) {
          return res.status(401).json({
            message: "Token de autenticação inválido. Verifique o token configurado.",
            status: "error"
          });
        }

        if (response.status === 404) {
          // 404 é esperado para um processo inexistente, mas significa que a API está funcionando
          return res.json({
            message: "Conexão com a API estabelecida com sucesso!",
            status: "success",
            details: "A API está respondendo corretamente."
          });
        }

        if (response.ok) {
          return res.json({
            message: "Conexão com a API estabelecida com sucesso!",
            status: "success"
          });
        }

        return res.status(response.status).json({
          message: `API retornou status ${response.status}`,
          status: "warning"
        });
      } catch (fetchError: any) {
        clearTimeout(timeoutId);

        if (fetchError.name === 'AbortError') {
          return res.status(504).json({
            message: "Timeout na conexão. A API demorou muito para responder.",
            status: "error"
          });
        }

        throw fetchError;
      }
    } catch (error: any) {
      console.error('❌ Erro no teste de conexão:', error);

      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          message: "Não foi possível conectar à API. Verifique se a URL e porta estão corretas.",
          status: "error"
        });
      }

      if (error.code === 'ENOTFOUND') {
        return res.status(503).json({
          message: "URL da API não encontrada. Verifique o endereço configurado.",
          status: "error"
        });
      }

      return res.status(500).json({
        message: "Erro ao testar conexão",
        status: "error",
        error: error.message
      });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();

      // Tentar buscar métricas do Google Analytics se o script estiver configurado
      let analyticsData = null;
      try {
        const scriptsData = await storage.getScripts();
        if (scriptsData?.googleAnalytics) {
          // Extrair o GA Measurement ID (formato: G-XXXXXXXXXX)
          const gaMatch = scriptsData.googleAnalytics.match(/G-[A-Z0-9]+/);
          if (gaMatch) {
            analyticsData = {
              measurementId: gaMatch[0],
              // Nota: Para dados reais do GA, seria necessário configurar o Google Analytics Data API
              // com credenciais de serviço. Por enquanto, retornamos apenas o ID.
              configured: true,
              message: "Google Analytics configurado. Para métricas detalhadas, configure a Data API com credenciais de serviço."
            };
          }
        }
      } catch (analyticsError) {
        console.error("Erro ao buscar dados do Google Analytics:", analyticsError);
      }

      res.json({
        ...stats,
        analytics: analyticsData
      });
    } catch (error) {
      console.error("Erro ao buscar estatísticas do dashboard:", error);
      res.status(500).json({ message: "Erro ao buscar estatísticas do dashboard" });
    }
  });

  // Informacoes routes
  app.get("/api/informacoes", async (req, res) => {
    try {
      const informacoes = await storage.getAllInformacoes();
      res.json({ informacoes });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar informações" });
    }
  });

  app.get("/api/informacoes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const informacao = await storage.getInformacao(id);

      if (!informacao) {
        return res.status(404).json({ message: "Informação não encontrada" });
      }

      res.json({ informacao });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar informação" });
    }
  });

  app.post("/api/informacoes", requireAdmin, async (req, res) => {
    try {
      console.log("Dados recebidos:", req.body);
      const informacaoData = insertInformacaoSchema.parse(req.body);
      console.log("Dados validados:", informacaoData);
      const newInformacao = await storage.createInformacao(informacaoData);
      console.log("Informação criada:", newInformacao);
      res.json({ informacao: newInformacao });
    } catch (error: any) {
      console.error("Erro ao criar informação:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar informação", error: error.message });
    }
  });

  app.put("/api/informacoes/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const informacaoData = insertInformacaoSchema.partial().parse(req.body);
      const updatedInformacao = await storage.updateInformacao(id, informacaoData);

      if (!updatedInformacao) {
        return res.status(404).json({ message: "Informação não encontrada" });
      }

      res.json({ informacao: updatedInformacao });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar informação" });
    }
  });

  app.delete("/api/informacoes/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteInformacao(id);

      if (!deleted) {
        return res.status(404).json({ message: "Informação não encontrada" });
      }

      res.json({ message: "Informação deletada com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar informação" });
    }
  });

  // Upload aviso image
  app.post("/api/upload/aviso", requireAdmin, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhuma imagem enviada" });
      }
      const filePath = `/uploads/${req.file.filename}`;
      res.json({ filePath });
    } catch (error) {
      res.status(500).json({ message: "Erro ao fazer upload da imagem" });
    }
  });

  // Avisos routes
  app.get("/api/avisos", async (req, res) => {
    try {
      const avisos = await storage.getAllAvisos();
      res.json({ avisos });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar avisos" });
    }
  });

  app.get("/api/avisos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const aviso = await storage.getAviso(id);

      if (!aviso) {
        return res.status(404).json({ message: "Aviso não encontrado" });
      }

      res.json({ aviso });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar aviso" });
    }
  });

  app.post("/api/avisos", requireAdmin, async (req, res) => {
    try {
      console.log("Dados recebidos:", req.body);
      const avisoData = insertAvisoSchema.parse(req.body);
      console.log("Dados validados:", avisoData);
      const newAviso = await storage.createAviso(avisoData);
      console.log("Aviso criado:", newAviso);
      res.json({ aviso: newAviso });
    } catch (error: any) {
      console.error("Erro ao criar aviso:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar aviso", error: error.message });
    }
  });

  app.put("/api/avisos/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const avisoData = insertAvisoSchema.partial().parse(req.body);
      const updatedAviso = await storage.updateAviso(id, avisoData);

      if (!updatedAviso) {
        return res.status(404).json({ message: "Aviso não encontrado" });
      }

      res.json({ aviso: updatedAviso });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar aviso" });
    }
  });

  app.delete("/api/avisos/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAviso(id);

      if (!deleted) {
        return res.status(404).json({ message: "Aviso não encontrado" });
      }

      res.json({ message: "Aviso deletado com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar aviso" });
    }
  });

  // Review Images routes
  app.get("/api/review-images", async (req, res) => {
    try {
      const reviewImages = await storage.getAllReviewImages();
      res.json({ reviewImages });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar imagens" });
    }
  });

  app.post("/api/upload/review-image", requireAdmin, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhuma imagem enviada" });
      }

      const filePath = `/uploads/${req.file.filename}`;
      res.json({ filePath });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ message: error.message || "Erro ao fazer upload" });
    }
  });

  app.post("/api/review-images", requireAdmin, async (req, res) => {
    try {
      const reviewImageData = insertReviewImageSchema.parse(req.body);
      const newReviewImage = await storage.createReviewImage(reviewImageData);
      res.status(201).json({ reviewImage: newReviewImage });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar imagem" });
    }
  });

  app.put("/api/review-images/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reviewImageData = insertReviewImageSchema.partial().parse(req.body);
      const updatedReviewImage = await storage.updateReviewImage(id, reviewImageData);

      if (!updatedReviewImage) {
        return res.status(404).json({ message: "Imagem não encontrada" });
      }

      res.json({ reviewImage: updatedReviewImage });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar imagem" });
    }
  });

  app.delete("/api/review-images/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteReviewImage(id);

      if (!deleted) {
        return res.status(404).json({ message: "Imagem não encontrada" });
      }

      res.json({ message: "Imagem deletada com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar imagem" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
