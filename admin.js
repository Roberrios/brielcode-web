(() => {
    const config = window.BRIELCODE_SUPABASE_CONFIG;
    const loginPanel = document.getElementById("login-panel");
    const recoveryPanel = document.getElementById("recovery-panel");
    const dashboard = document.getElementById("dashboard-panel");
    const loginMessage = document.getElementById("login-message");
    const recoveryMessage = document.getElementById("recovery-message");
    const dashboardMessage = document.getElementById("dashboard-message");
    const loginForm = document.getElementById("login-form");
    const recoveryForm = document.getElementById("recovery-form");
    const contentForm = document.getElementById("content-form");
    const serviceForm = document.getElementById("service-form");
    const projectForm = document.getElementById("project-form");
    const loginButton = loginForm.querySelector('button[type="submit"]');
    const imageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
    const imageLimit = 8 * 1024 * 1024;
    let projectGallery = [];
    let removeProfileImage = false;
    let removeHeroImage = false;
    const contentGroups = [
        {
            title: "Marca y navegación",
            fields: [
                ["brand_name", "Nombre de la marca"],
                ["brand_initial", "Letra para el monograma"],
                ["location", "Ubicación"],
                ["nav_services", "Enlace de navegación: servicios"],
                ["nav_projects", "Enlace de navegación: proyectos"],
                ["nav_about", "Enlace de navegación: sobre mí"],
                ["nav_cta", "Botón de navegación"]
            ]
        },
        {
            title: "Vista previa en buscadores",
            fields: [
                ["page_title", "Título de la página"],
                ["meta_description", "Descripción SEO", true]
            ]
        },
        {
            title: "Portada",
            fields: [
                ["hero_eyebrow", "Texto pequeño sobre el titular"],
                ["hero_title", "Titular principal"],
                ["hero_highlight", "Frase resaltada"],
                ["hero_description", "Texto introductorio", true],
                ["hero_cta", "Texto del botón principal"],
                ["hero_secondary_cta", "Texto del enlace secundario"],
                ["hero_proof", "Texto destacado junto al sello"]
            ]
        },
        {
            title: "Franja de valores",
            fields: [
                ["trust_1", "Primer valor"],
                ["trust_2", "Segundo valor"],
                ["trust_3", "Tercer valor"],
                ["trust_4", "Cuarto valor"]
            ]
        },
        {
            title: "Servicios y portafolio",
            fields: [
                ["services_eyebrow", "Texto pequeño de servicios"],
                ["services_title", "Título de servicios", true],
                ["services_description", "Descripción de servicios", true],
                ["portfolio_eyebrow", "Texto pequeño del portafolio"],
                ["portfolio_title", "Título del portafolio", true],
                ["portfolio_description", "Descripción del portafolio", true]
            ]
        },
        {
            title: "Sobre mí",
            fields: [
                ["about_eyebrow", "Texto pequeño de la sección"],
                ["about_title", "Título", true],
                ["about_paragraph_1", "Primer párrafo", true],
                ["about_paragraph_2", "Segundo párrafo", true],
                ["about_cta", "Texto del enlace"]
            ]
        },
        {
            title: "Contacto y pie de página",
            fields: [
                ["contact_eyebrow", "Texto pequeño de contacto"],
                ["contact_title", "Título de contacto", true],
                ["contact_description", "Descripción de contacto", true],
                ["contact_cta", "Texto del botón de contacto"],
                ["whatsapp_number", "Número de WhatsApp (con indicativo, solo números)", false, "573001234567"],
                ["whatsapp_message", "Mensaje inicial de WhatsApp", true],
                ["footer_text", "Texto del pie de página", true]
            ]
        }
    ];
    const defaultContent = {
        brand_name: "BrielCode",
        brand_initial: "B",
        location: "Valledupar, Colombia",
        nav_services: "Servicios",
        nav_projects: "Proyectos",
        nav_about: "Sobre mí",
        nav_cta: "Hablemos",
        page_title: "BrielCode | Desarrollo digital para tu negocio",
        meta_description: "Desarrollo web, comercio electrónico y automatización para empresas en Colombia.",
        hero_eyebrow: "DESARROLLO DIGITAL · COLOMBIA",
        hero_title: "Tu negocio merece",
        hero_highlight: "crecer sin límites.",
        hero_description: "Creamos experiencias digitales, tiendas online y automatizaciones que convierten buenas ideas en negocios preparados para crecer.",
        hero_cta: "Hablemos de tu proyecto",
        hero_secondary_cta: "Conoce nuestro trabajo",
        hero_proof: "personas y negocios reales.",
        trust_1: "DISEÑO CON PROPÓSITO",
        trust_2: "TECNOLOGÍA ESCALABLE",
        trust_3: "ACOMPAÑAMIENTO REAL",
        trust_4: "COLOMBIA",
        services_eyebrow: "QUÉ HACEMOS",
        services_title: "Tecnología que trabaja\npara tu negocio.",
        services_description: "Soluciones digitales pensadas para resolver problemas reales, mejorar procesos y ayudarte a avanzar con confianza.",
        portfolio_eyebrow: "TRABAJO SELECCIONADO",
        portfolio_title: "Ideas que ya están\nhaciendo la diferencia.",
        portfolio_description: "Cada proyecto empieza escuchando. El resultado: herramientas útiles, hechas para durar y crecer junto a quienes las usan.",
        about_eyebrow: "QUIÉN ESTÁ DETRÁS",
        about_title: "Construimos con propósito. Crecemos contigo.",
        about_paragraph_1: "Soy ingeniero de software y me apasiona convertir desafíos cotidianos en soluciones digitales simples, bien diseñadas y confiables.",
        about_paragraph_2: "BrielCode nace con una visión de legado y compromiso a largo plazo. Cada proyecto lo construyo con dedicación, como si fuera propio.",
        about_cta: "Cuéntame tu idea",
        contact_eyebrow: "TU SIGUIENTE PASO",
        contact_title: "¿Y si hacemos realidad lo que tienes en mente?",
        contact_description: "Cuéntame qué necesitas. Hablemos de cómo la tecnología puede ayudarte a llegar más lejos.",
        contact_cta: "Empecemos a conversar",
        whatsapp_number: "",
        whatsapp_message: "Hola, quiero hablar sobre un proyecto.",
        footer_text: "Diseño y desarrollo digital desde Valledupar, Colombia.",
        profile_image: "",
        profile_image_path: "",
        hero_image: "",
        hero_image_path: ""
    };
    let client = null;
    let currentContent = { ...defaultContent };
    let services = [];
    let projects = [];
    let activeUserId = null;

    function showMessage(element, message, isError = false) {
        element.textContent = message;
        element.classList.toggle("is-error", isError);
        element.hidden = false;
    }

    function clearMessage(element) {
        element.hidden = true;
        element.textContent = "";
        element.classList.remove("is-error");
    }

    function setBusy(form, busy, buttonText) {
        const button = form.querySelector('button[type="submit"]');
        if (!button) return;
        if (busy) {
            button.dataset.originalText = button.textContent;
            button.disabled = true;
            button.textContent = buttonText;
        } else {
            button.disabled = false;
            button.textContent = button.dataset.originalText || button.textContent;
        }
    }

    function makeLabel(text, control) {
        const label = document.createElement("label");
        label.append(document.createTextNode(text));
        label.append(control);
        return label;
    }

    function buildContentForm() {
        contentGroups.forEach((group) => {
            const fieldset = document.createElement("fieldset");
            fieldset.className = "admin-fieldset";
            const legend = document.createElement("legend");
            legend.textContent = group.title;
            fieldset.append(legend);
            group.fields.forEach(([key, title, multiline, placeholder]) => {
                const control = document.createElement(multiline ? "textarea" : "input");
                control.name = key;
                if (multiline) control.rows = key.includes("description") || key.includes("paragraph") ? 3 : 2;
                if (placeholder) control.placeholder = placeholder;
                control.required = key !== "whatsapp_number";
                fieldset.append(makeLabel(title, control));
            });
            contentForm.append(fieldset);
        });

        const imageFieldset = document.createElement("fieldset");
        imageFieldset.className = "admin-fieldset";
        const legend = document.createElement("legend");
        legend.textContent = "Imágenes del sitio";
        const input = document.createElement("input");
        input.name = "profile_image";
        input.type = "file";
        input.accept = "image/jpeg,image/png,image/webp,image/avif";
        imageFieldset.append(legend, makeLabel("Subir imagen", input));
        const help = document.createElement("span");
        help.className = "admin-help";
        help.textContent = "JPG, PNG, WebP o AVIF. Máximo 8 MB.";
        imageFieldset.append(help);
        const preview = document.createElement("div");
        preview.className = "admin-image-preview";
        preview.id = "profile-image-preview";
        preview.hidden = true;
        imageFieldset.append(preview);
        const heroInput = document.createElement("input");
        heroInput.name = "hero_image";
        heroInput.type = "file";
        heroInput.accept = "image/jpeg,image/png,image/webp,image/avif";
        imageFieldset.append(makeLabel("Imagen de portada opcional (reemplaza la ilustración)", heroInput));
        const heroHelp = document.createElement("span");
        heroHelp.className = "admin-help";
        heroHelp.textContent = "JPG, PNG, WebP o AVIF. Máximo 8 MB.";
        imageFieldset.append(heroHelp);
        const heroPreview = document.createElement("div");
        heroPreview.className = "admin-image-preview";
        heroPreview.id = "hero-image-preview";
        heroPreview.hidden = true;
        imageFieldset.append(heroPreview);
        contentForm.append(imageFieldset);

        const submit = document.createElement("button");
        submit.className = "button button-primary admin-submit";
        submit.type = "submit";
        submit.textContent = "Guardar cambios";
        contentForm.append(submit);
    }

    function fillContentForm() {
        Object.entries(currentContent).forEach(([key, value]) => {
            const field = contentForm.elements.namedItem(key);
            if (field && field.type !== "file") field.value = value || "";
        });
        const preview = document.getElementById("profile-image-preview");
        if (currentContent.profile_image) showPreview(preview, currentContent.profile_image, true);
        const heroPreview = document.getElementById("hero-image-preview");
        if (currentContent.hero_image) showPreview(heroPreview, currentContent.hero_image, true);
    }

    function showPreview(preview, url, stored = false) {
        preview.replaceChildren();
        const image = document.createElement("img");
        image.src = url;
        image.alt = "Vista previa";
        preview.append(image);
        const remove = document.createElement("button");
        remove.className = "admin-preview-remove";
        remove.type = "button";
        remove.dataset.stored = String(stored);
        remove.textContent = "Quitar imagen";
        preview.append(remove);
        preview.hidden = false;
    }

    function validateImage(file) {
        if (!file) return;
        if (!imageTypes.has(file.type)) throw new Error("El formato de la imagen debe ser JPG, PNG, WebP o AVIF.");
        if (file.size > imageLimit) throw new Error("La imagen supera el límite de 8 MB.");
    }

    async function uploadImage(file) {
        validateImage(file);
        const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
        const path = `${activeUserId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
        const { error } = await client.storage.from("portafolio").upload(path, file, {
            contentType: file.type,
            upsert: false
        });
        if (error) throw error;
        const { data } = client.storage.from("portafolio").getPublicUrl(path);
        return { path, url: data.publicUrl };
    }

    async function loadDashboard(user) {
        activeUserId = user.id;
        document.getElementById("admin-email").textContent = user.email || "";
        const access = await client.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
        if (access.error) throw access.error;
        if (!access.data) {
            await client.auth.signOut();
            throw new Error("Esta cuenta no tiene permisos de administrador.");
        }

        const [contentResult, servicesResult, projectsResult] = await Promise.all([
            client.from("site_content").select("content").eq("id", "main").maybeSingle(),
            client.from("services").select("*").order("sort_order"),
            client.from("projects").select("*").order("sort_order")
        ]);
        if (contentResult.error) throw contentResult.error;
        if (servicesResult.error) throw servicesResult.error;
        if (projectsResult.error) throw projectsResult.error;

        currentContent = { ...defaultContent, ...(contentResult.data ? contentResult.data.content : {}) };
        services = servicesResult.data || [];
        projects = projectsResult.data || [];
        fillContentForm();
        renderServices();
        renderProjects();
        loginPanel.hidden = true;
        recoveryPanel.hidden = true;
        dashboard.hidden = false;
        window.history.replaceState({}, document.title, window.location.pathname);
        clearMessage(loginMessage);
        clearMessage(recoveryMessage);
        clearMessage(dashboardMessage);
    }

    function showLogin(message) {
        dashboard.hidden = true;
        recoveryPanel.hidden = true;
        loginPanel.hidden = false;
        activeUserId = null;
        if (message) showMessage(loginMessage, message, true);
    }

    function createAdminCard(item, type) {
        const card = document.createElement("article");
        card.className = "admin-item";
        const details = document.createElement("div");
        details.className = "admin-item-details";
        const title = document.createElement("strong");
        title.textContent = item.title;
        const description = document.createElement("p");
        description.textContent = item.description;
        const meta = document.createElement("span");
        meta.className = "admin-item-meta";
        meta.textContent = item.published ? "Publicado" : "Oculto";
        details.append(title, description, meta);
        const actions = document.createElement("div");
        actions.className = "admin-item-actions";
        const edit = document.createElement("button");
        edit.className = "admin-text-button";
        edit.type = "button";
        edit.textContent = "Editar";
        edit.addEventListener("click", () => editItem(item, type));
        const remove = document.createElement("button");
        remove.className = "admin-text-button admin-delete";
        remove.type = "button";
        remove.textContent = "Eliminar";
        remove.addEventListener("click", () => deleteItem(item, type));
        actions.append(edit, remove);
        card.append(details, actions);
        return card;
    }

    function renderServices() {
        const list = document.getElementById("services-admin-list");
        list.replaceChildren();
        services.forEach((service) => list.append(createAdminCard(service, "service")));
        if (!services.length) list.append(emptyList("Aún no has agregado servicios."));
    }

    function renderProjects() {
        const list = document.getElementById("projects-admin-list");
        list.replaceChildren();
        projects.forEach((project) => list.append(createAdminCard(project, "project")));
        if (!projects.length) list.append(emptyList("Aún no has agregado proyectos."));
    }

    function renderProjectGalleryPreview(pendingFiles = []) {
        const preview = document.getElementById("project-gallery-preview");
        preview.replaceChildren();
        projectGallery.forEach((image, index) => {
            const item = document.createElement("div");
            item.className = "admin-gallery-item";
            const thumbnail = document.createElement("img");
            thumbnail.src = image.url;
            thumbnail.alt = "Imagen de galería";
            const remove = document.createElement("button");
            remove.className = "admin-gallery-remove";
            remove.type = "button";
            remove.dataset.galleryIndex = String(index);
            remove.setAttribute("aria-label", "Quitar imagen de galería");
            remove.textContent = "×";
            item.append(thumbnail, remove);
            preview.append(item);
        });
        pendingFiles.forEach((file, index) => {
            const item = document.createElement("div");
            item.className = "admin-gallery-item admin-gallery-pending";
            const name = document.createElement("span");
            name.textContent = file.name;
            const remove = document.createElement("button");
            remove.className = "admin-gallery-remove";
            remove.type = "button";
            remove.dataset.pendingIndex = String(index);
            remove.setAttribute("aria-label", "Quitar imagen seleccionada");
            remove.textContent = "×";
            item.append(name, remove);
            preview.append(item);
        });
    }

    function emptyList(message) {
        const empty = document.createElement("p");
        empty.className = "admin-empty";
        empty.textContent = message;
        return empty;
    }

    function editItem(item, type) {
        const form = type === "service" ? serviceForm : projectForm;
        const title = document.getElementById(`${type}-form-title`);
        title.textContent = type === "service" ? "Editar servicio" : "Editar proyecto";
        Object.entries(item).forEach(([key, value]) => {
            const field = form.elements.namedItem(key);
            if (!field || field.type === "file") return;
            field.value = key === "tags" ? (value || []).join(", ") : value ?? "";
            if (field.type === "checkbox") field.checked = Boolean(value);
        });
        if (type === "project" && item.image_url) {
            showPreview(document.getElementById("project-image-preview"), item.image_url);
        }
        if (type === "project") {
            projectGallery = (item.gallery_urls || []).map((url, index) => ({
                url,
                path: (item.gallery_paths || [])[index] || ""
            }));
            renderProjectGalleryPreview();
        }
        form.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function resetEditor(form) {
        form.reset();
        form.elements.namedItem("id").value = "";
        const type = form === serviceForm ? "service" : "project";
        document.getElementById(`${type}-form-title`).textContent = type === "service" ? "Agregar servicio" : "Agregar proyecto";
        if (type === "project") {
            const preview = document.getElementById("project-image-preview");
            preview.replaceChildren();
            preview.hidden = true;
            projectGallery = [];
            renderProjectGalleryPreview();
        }
    }

    async function deleteItem(item, type) {
        const kind = type === "service" ? "servicio" : "proyecto";
        if (!window.confirm(`¿Eliminar "${item.title}"? Esta acción no se puede deshacer.`)) return;
        clearMessage(dashboardMessage);
        const table = type === "service" ? "services" : "projects";
        const { error } = await client.from(table).delete().eq("id", item.id);
        if (error) {
            showMessage(dashboardMessage, `No se pudo eliminar el ${kind}: ${error.message}`, true);
            return;
        }
        if (type === "service") {
            services = services.filter((service) => service.id !== item.id);
            renderServices();
        } else {
            projects = projects.filter((project) => project.id !== item.id);
            renderProjects();
            const imagePaths = [...new Set([item.image_path, ...(item.gallery_paths || [])].filter(Boolean))];
            if (imagePaths.length) {
                const { error: storageError } = await client.storage.from("portafolio").remove(imagePaths);
                if (storageError) {
                    showMessage(dashboardMessage, `El proyecto se eliminó, pero no se pudieron eliminar todas sus imágenes: ${storageError.message}`, true);
                    return;
                }
            }
        }
        resetEditor(type === "service" ? serviceForm : projectForm);
        showMessage(dashboardMessage, `Se eliminó el ${kind}.`);
    }

    async function saveContent(event) {
        event.preventDefault();
        clearMessage(dashboardMessage);
        setBusy(contentForm, true, "Guardando...");
        const uploadedPaths = [];
        try {
            const updated = { ...currentContent };
            contentGroups.forEach((group) => group.fields.forEach(([key]) => {
                updated[key] = contentForm.elements.namedItem(key).value.trim();
            }));
            const number = updated.whatsapp_number.replace(/\D/g, "");
            if (updated.whatsapp_number && number.length < 10) {
                throw new Error("Escribe el número de WhatsApp con indicativo de país (mínimo 10 dígitos).");
            }
            updated.whatsapp_number = number;

            const file = contentForm.elements.namedItem("profile_image").files[0];
            if (file) {
                const image = await uploadImage(file);
                updated.profile_image = image.url;
                updated.profile_image_path = image.path;
                uploadedPaths.push(image.path);
            } else if (removeProfileImage) {
                updated.profile_image = "";
                updated.profile_image_path = "";
            }
            const heroFile = contentForm.elements.namedItem("hero_image").files[0];
            if (heroFile) {
                const image = await uploadImage(heroFile);
                updated.hero_image = image.url;
                updated.hero_image_path = image.path;
                uploadedPaths.push(image.path);
            } else if (removeHeroImage) {
                updated.hero_image = "";
                updated.hero_image_path = "";
            }
            const { error } = await client.from("site_content").upsert({ id: "main", content: updated }, { onConflict: "id" });
            if (error) throw error;
            const replacedPaths = [
                currentContent.profile_image_path && currentContent.profile_image_path !== updated.profile_image_path && currentContent.profile_image_path,
                currentContent.hero_image_path && currentContent.hero_image_path !== updated.hero_image_path && currentContent.hero_image_path
            ].filter(Boolean);
            let cleanupWarning = "";
            if (replacedPaths.length) {
                const { error: storageError } = await client.storage.from("portafolio").remove(replacedPaths);
                if (storageError) cleanupWarning = ` No se pudieron eliminar imágenes anteriores: ${storageError.message}`;
            }
            currentContent = updated;
            removeProfileImage = false;
            removeHeroImage = false;
            contentForm.elements.namedItem("profile_image").value = "";
            contentForm.elements.namedItem("hero_image").value = "";
            showMessage(dashboardMessage, `Contenido guardado. Los cambios ya aparecen en la página pública.${cleanupWarning}`, Boolean(cleanupWarning));
            fillContentForm();
        } catch (error) {
            let cleanupMessage = "";
            if (uploadedPaths.length) {
                const { error: cleanupError } = await client.storage.from("portafolio").remove(uploadedPaths);
                if (cleanupError) cleanupMessage = ` No se pudieron limpiar las imágenes recién subidas: ${cleanupError.message}`;
            }
            showMessage(dashboardMessage, `No se pudieron guardar los cambios: ${error.message}${cleanupMessage}`, true);
        } finally {
            setBusy(contentForm, false);
        }
    }

    async function saveService(event) {
        event.preventDefault();
        clearMessage(dashboardMessage);
        setBusy(serviceForm, true, "Guardando...");
        try {
            const form = new FormData(serviceForm);
            const id = form.get("id");
            const record = {
                title: String(form.get("title")).trim(),
                description: String(form.get("description")).trim(),
                icon: String(form.get("icon")).trim() || "✳",
                sort_order: Number(form.get("sort_order")),
                published: form.get("published") === "on"
            };
            const query = id
                ? client.from("services").update(record).eq("id", id).select().single()
                : client.from("services").insert(record).select().single();
            const { data, error } = await query;
            if (error) throw error;
            if (id) services = services.map((service) => service.id === id ? data : service);
            else services.push(data);
            services.sort((a, b) => a.sort_order - b.sort_order);
            renderServices();
            resetEditor(serviceForm);
            showMessage(dashboardMessage, "Servicio guardado correctamente.");
        } catch (error) {
            showMessage(dashboardMessage, `No se pudo guardar el servicio: ${error.message}`, true);
        } finally {
            setBusy(serviceForm, false);
        }
    }

    async function saveProject(event) {
        event.preventDefault();
        clearMessage(dashboardMessage);
        setBusy(projectForm, true, "Guardando...");
        const uploadedPaths = [];
        try {
            const form = new FormData(projectForm);
            const id = String(form.get("id") || "");
            const previous = projects.find((project) => project.id === id);
            const projectUrl = String(form.get("project_url") || "").trim();
            if (projectUrl && !/^https?:\/\//i.test(projectUrl)) {
                throw new Error("El enlace del proyecto debe comenzar por https:// o http://.");
            }
            const yearValue = String(form.get("project_year") || "").trim();
            const projectYear = yearValue ? Number(yearValue) : null;
            if (projectYear !== null && (!Number.isInteger(projectYear) || projectYear < 2000 || projectYear > 2100)) {
                throw new Error("El año del proyecto debe estar entre 2000 y 2100.");
            }
            let imageUrl = previous ? previous.image_url : null;
            let imagePath = previous ? previous.image_path : null;
            const file = form.get("image");
            if (file && file.size) {
                validateImage(file);
                const image = await uploadImage(file);
                imageUrl = image.url;
                imagePath = image.path;
                uploadedPaths.push(image.path);
            }
            const galleryFiles = form.getAll("gallery").filter((image) => image instanceof File && image.size > 0);
            galleryFiles.forEach(validateImage);
            for (const galleryFile of galleryFiles) {
                const image = await uploadImage(galleryFile);
                uploadedPaths.push(image.path);
                projectGallery.push(image);
            }
            renderProjectGalleryPreview();
            const record = {
                title: String(form.get("title")).trim(),
                category: String(form.get("category") || "").trim() || "Proyecto destacado",
                client_name: String(form.get("client_name") || "").trim(),
                project_year: projectYear,
                project_role: String(form.get("project_role") || "").trim(),
                description: String(form.get("description")).trim(),
                challenge: String(form.get("challenge") || "").trim(),
                solution: String(form.get("solution") || "").trim(),
                results: String(form.get("results") || "").trim(),
                tags: String(form.get("tags") || "").split(",").map((tag) => tag.trim()).filter(Boolean),
                project_url: projectUrl || null,
                image_url: imageUrl,
                image_path: imagePath,
                gallery_urls: projectGallery.map((image) => image.url),
                gallery_paths: projectGallery.map((image) => image.path).filter(Boolean),
                sort_order: Number(form.get("sort_order")),
                published: form.get("published") === "on"
            };
            const query = id
                ? client.from("projects").update(record).eq("id", id).select().single()
                : client.from("projects").insert(record).select().single();
            const { data, error } = await query;
            if (error) throw error;
            let cleanupWarning = "";
            if (previous) {
                const retainedPaths = new Set([imagePath, ...record.gallery_paths].filter(Boolean));
                const removedPaths = [...new Set([previous.image_path, ...(previous.gallery_paths || [])]
                    .filter((path) => path && !retainedPaths.has(path)))];
                if (removedPaths.length) {
                    const { error: storageError } = await client.storage.from("portafolio").remove(removedPaths);
                    if (storageError) cleanupWarning = ` El proyecto se guardó, pero no se pudieron eliminar algunas imágenes anteriores: ${storageError.message}`;
                }
            }
            if (id) projects = projects.map((project) => project.id === id ? data : project);
            else projects.push(data);
            projects.sort((a, b) => a.sort_order - b.sort_order);
            renderProjects();
            resetEditor(projectForm);
            showMessage(dashboardMessage, `Proyecto guardado correctamente.${cleanupWarning}`, Boolean(cleanupWarning));
        } catch (error) {
            let cleanupMessage = "";
            if (uploadedPaths.length) {
                const { error: cleanupError } = await client.storage.from("portafolio").remove(uploadedPaths);
                if (cleanupError) cleanupMessage = ` No se pudieron limpiar las imágenes recién subidas: ${cleanupError.message}`;
                projectGallery = projectGallery.filter((image) => !uploadedPaths.includes(image.path));
                renderProjectGalleryPreview();
            }
            showMessage(dashboardMessage, `No se pudo guardar el proyecto: ${error.message}${cleanupMessage}`, true);
        } finally {
            setBusy(projectForm, false);
        }
    }

    function setupTabs() {
        document.querySelectorAll(".admin-tab").forEach((button) => {
            button.addEventListener("click", () => {
                document.querySelectorAll(".admin-tab").forEach((tab) => tab.classList.toggle("is-active", tab === button));
                document.querySelectorAll(".admin-panel").forEach((panel) => {
                    const active = panel.id === `tab-${button.dataset.tab}`;
                    panel.hidden = !active;
                    panel.classList.toggle("is-active", active);
                });
                clearMessage(dashboardMessage);
            });
        });
    }

    async function start() {
        setupTabs();
        if (!config || !config.url || !config.anonKey) {
            loginButton.disabled = true;
            document.getElementById("forgot-password").disabled = true;
            showMessage(loginMessage, "Configura la URL y la clave anon/publishable de Supabase en supabase-config.js para habilitar el panel.", true);
            return;
        }
        if (!window.supabase) {
            loginButton.disabled = true;
            document.getElementById("forgot-password").disabled = true;
            showMessage(loginMessage, "No se pudo cargar el cliente de Supabase. Comprueba la conexión e inténtalo de nuevo.", true);
            return;
        }
        client = window.supabase.createClient(config.url, config.anonKey);
        const { data, error } = await client.auth.getSession();
        if (error) throw error;
        if (new URLSearchParams(window.location.search).has("reset") && data.session) {
            loginPanel.hidden = true;
            recoveryPanel.hidden = false;
        } else if (data.session) {
            await loadDashboard(data.session.user);
        }
        client.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_OUT") {
                showLogin();
                return;
            }
            if (event === "PASSWORD_RECOVERY" && session) {
                loginPanel.hidden = true;
                dashboard.hidden = true;
                recoveryPanel.hidden = false;
            }
        });
    }

    buildContentForm();

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearMessage(loginMessage);
        setBusy(loginForm, true, "Ingresando...");
        try {
            const values = new FormData(loginForm);
            const { data, error } = await client.auth.signInWithPassword({
                email: String(values.get("email")).trim(),
                password: String(values.get("password"))
            });
            if (error) throw error;
            await loadDashboard(data.user);
        } catch (error) {
            showMessage(loginMessage, `No se pudo iniciar sesión: ${error.message}`, true);
        } finally {
            setBusy(loginForm, false);
        }
    });

    document.getElementById("forgot-password").addEventListener("click", async () => {
        const email = loginForm.elements.namedItem("email").value.trim();
        if (!email) {
            showMessage(loginMessage, "Escribe tu correo electrónico para enviarte el enlace de recuperación.", true);
            return;
        }
        try {
            const { error } = await client.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/admin?reset=1`
            });
            if (error) throw error;
            showMessage(loginMessage, "Si el correo existe, recibirás instrucciones para recuperar tu contraseña.");
        } catch (error) {
            showMessage(loginMessage, `No se pudo enviar el enlace: ${error.message}`, true);
        }
    });

    document.getElementById("logout-button").addEventListener("click", async () => {
        const { error } = await client.auth.signOut();
        if (error) showMessage(dashboardMessage, `No se pudo cerrar sesión: ${error.message}`, true);
    });

    recoveryForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearMessage(recoveryMessage);
        setBusy(recoveryForm, true, "Actualizando...");
        try {
            const values = new FormData(recoveryForm);
            const password = String(values.get("password"));
            if (password !== String(values.get("confirmation"))) {
                throw new Error("Las contraseñas no coinciden.");
            }
            const { data, error } = await client.auth.updateUser({ password });
            if (error) throw error;
            recoveryForm.reset();
            await loadDashboard(data.user);
            showMessage(dashboardMessage, "Contraseña actualizada correctamente.");
        } catch (error) {
            showMessage(recoveryMessage, `No se pudo actualizar la contraseña: ${error.message}`, true);
        } finally {
            setBusy(recoveryForm, false);
        }
    });

    contentForm.addEventListener("submit", saveContent);
    serviceForm.addEventListener("submit", saveService);
    projectForm.addEventListener("submit", saveProject);
    document.querySelectorAll(".cancel-edit").forEach((button) => {
        button.addEventListener("click", () => resetEditor(document.getElementById(button.dataset.form)));
    });
    ["profile-image-preview", "hero-image-preview"].forEach((previewId) => {
        const preview = document.getElementById(previewId);
        preview.addEventListener("click", (event) => {
            const remove = event.target.closest("[data-stored]");
            if (!remove) return;
            const isProfile = previewId === "profile-image-preview";
            const fieldName = isProfile ? "profile_image" : "hero_image";
            if (remove.dataset.stored === "true") {
                if (isProfile) removeProfileImage = true;
                else removeHeroImage = true;
            }
            contentForm.elements.namedItem(fieldName).value = "";
            if (!isProfile && currentContent.hero_image && remove.dataset.stored !== "true") {
                showPreview(preview, currentContent.hero_image, true);
            } else if (isProfile && currentContent.profile_image && remove.dataset.stored !== "true") {
                showPreview(preview, currentContent.profile_image, true);
            } else {
                preview.replaceChildren();
                preview.hidden = true;
            }
        });
    });
    document.getElementById("project-gallery-preview").addEventListener("click", (event) => {
        const remove = event.target.closest("button");
        if (!remove) return;
        if (remove.dataset.galleryIndex !== undefined) {
            projectGallery.splice(Number(remove.dataset.galleryIndex), 1);
            renderProjectGalleryPreview(Array.from(projectForm.elements.namedItem("gallery").files));
        }
        if (remove.dataset.pendingIndex !== undefined) {
            const galleryInput = projectForm.elements.namedItem("gallery");
            const files = Array.from(galleryInput.files);
            files.splice(Number(remove.dataset.pendingIndex), 1);
            const transfer = new DataTransfer();
            files.forEach((file) => transfer.items.add(file));
            galleryInput.files = transfer.files;
            renderProjectGalleryPreview(files);
        }
    });
    [contentForm.elements.namedItem("profile_image"), projectForm.elements.namedItem("image")].forEach((input) => {
        input.addEventListener("change", () => {
            const file = input.files[0];
            if (!file) return;
            try {
                validateImage(file);
                const preview = input.name === "profile_image"
                    ? document.getElementById("profile-image-preview")
                    : document.getElementById("project-image-preview");
                showPreview(preview, URL.createObjectURL(file));
            } catch (error) {
                showMessage(dashboardMessage, error.message, true);
                input.value = "";
            }
        });
    });
    contentForm.elements.namedItem("hero_image").addEventListener("change", (event) => {
        const input = event.currentTarget;
        const file = input.files[0];
        if (!file) return;
        try {
            validateImage(file);
            showPreview(document.getElementById("hero-image-preview"), URL.createObjectURL(file));
        } catch (error) {
            input.value = "";
            showMessage(dashboardMessage, error.message, true);
        }
    });
    projectForm.elements.namedItem("gallery").addEventListener("change", (event) => {
        const input = event.currentTarget;
        const files = Array.from(input.files);
        try {
            files.forEach(validateImage);
            renderProjectGalleryPreview(files);
            clearMessage(dashboardMessage);
        } catch (error) {
            input.value = "";
            renderProjectGalleryPreview();
            showMessage(dashboardMessage, error.message, true);
        }
    });

    start().catch((error) => {
        showLogin(`No se pudo conectar con Supabase: ${error.message}`);
        console.error("Error al iniciar el panel de administración:", error);
    });
})();
