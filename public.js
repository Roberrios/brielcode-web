(() => {
    const config = window.BRIELCODE_SUPABASE_CONFIG;
    const hasConfig = config && config.url && config.anonKey;

    document.getElementById("current-year").textContent = new Date().getFullYear();

    function setText(key, value) {
        if (typeof value !== "string") return;
        document.querySelectorAll(`[data-content="${key}"]`).forEach((element) => {
            element.textContent = value;
        });
    }

    function setImage(element, url, alt) {
        if (!url) return;
        element.replaceChildren();
        const image = document.createElement("img");
        image.src = url;
        image.alt = alt;
        image.loading = "lazy";
        element.append(image);
    }

    function setWhatsAppLinks(number, message) {
        const internationalNumber = String(number || "").replace(/\D/g, "");
        const floatingButton = document.getElementById("whatsapp-floating");
        floatingButton.hidden = !internationalNumber;
        if (!internationalNumber) return;
        const href = `https://wa.me/${internationalNumber}?text=${encodeURIComponent(message)}`;
        document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
            link.href = href;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
        });
    }

    function renderServices(services) {
        const list = document.getElementById("services-list");
        list.replaceChildren(...services.map((service, index) => {
            const card = document.createElement("article");
            card.className = "service-card";
            const icon = document.createElement("span");
            icon.className = "service-icon";
            icon.textContent = service.icon || "✳";
            const number = document.createElement("p");
            number.className = "card-index";
            number.textContent = `${String(index + 1).padStart(2, "0")} / ${service.title.toUpperCase()}`;
            const title = document.createElement("h3");
            title.textContent = service.title;
            const description = document.createElement("p");
            description.textContent = service.description;
            card.append(icon, number, title, description);
            return card;
        }));
    }

    function renderProjects(projects) {
        const list = document.getElementById("projects-list");
        const status = document.getElementById("projects-status");
        list.replaceChildren(...projects.map((project) => {
            const card = document.createElement("article");
            card.className = "project-card";
            const link = document.createElement("a");
            link.className = "project-card-link";
            link.href = `/proyecto?id=${encodeURIComponent(project.id)}`;
            link.setAttribute("aria-label", `Conocer más sobre ${project.title}`);
            const image = document.createElement("div");
            image.className = "project-image project-image-uploaded";
            if (project.image_url) {
                setImage(image, project.image_url, project.title);
            } else {
                image.classList.add("project-art", "project-art-three");
                const label = document.createElement("span");
                label.className = "project-image-label";
                label.textContent = "PROYECTO DESTACADO";
                image.append(label);
            }

            const info = document.createElement("div");
            info.className = "project-info";
            const titleWrap = document.createElement("div");
            const kicker = document.createElement("p");
            kicker.className = "project-kicker";
            kicker.textContent = (project.category || "PROYECTO DESTACADO").toUpperCase();
            const title = document.createElement("h3");
            title.textContent = project.title;
            titleWrap.append(kicker, title);
            const arrow = document.createElement("span");
            arrow.className = "project-arrow";
            arrow.setAttribute("aria-hidden", "true");
            arrow.textContent = "↗";
            const description = document.createElement("p");
            description.className = "project-description";
            description.textContent = project.description;
            const tags = document.createElement("div");
            tags.className = "tag-list";
            (project.tags || []).forEach((tag) => {
                const chip = document.createElement("span");
                chip.textContent = tag;
                tags.append(chip);
            });
            info.append(titleWrap, arrow, description, tags);
            link.append(image, info);
            card.append(link);
            return card;
        }));
        status.textContent = projects.length ? "" : "Aún no hay proyectos publicados.";
        status.hidden = projects.length > 0;
    }

    function showProjectsError(message) {
        const list = document.getElementById("projects-list");
        const status = document.getElementById("projects-status");
        list.replaceChildren();
        status.textContent = message;
        status.hidden = false;
    }

    async function loadContent() {
        if (!hasConfig) {
            showProjectsError("El portafolio no está conectado a Supabase.");
            return;
        }
        if (!window.supabase) {
            console.error("No se pudo cargar el cliente de Supabase.");
            showProjectsError("No se pudieron cargar los proyectos. Inténtalo de nuevo más tarde.");
            return;
        }
        const client = window.supabase.createClient(config.url, config.anonKey);
        const [contentResult, servicesResult, projectsResult] = await Promise.all([
            client.from("site_content").select("content").eq("id", "main").maybeSingle(),
            client.from("services").select("id, title, description, icon, sort_order").eq("published", true).order("sort_order"),
            client.from("projects").select("id, title, category, description, tags, image_url, project_url, sort_order").eq("published", true).order("sort_order")
        ]);

        if (contentResult.error) console.error("No se pudo cargar el contenido del sitio:", contentResult.error);
        if (servicesResult.error) console.error("No se pudieron cargar los servicios:", servicesResult.error);
        if (projectsResult.error) {
            console.error("No se pudieron cargar los proyectos publicados:", projectsResult.error);
            showProjectsError("No se pudieron cargar los proyectos publicados. Inténtalo de nuevo más tarde.");
        } else {
            renderProjects(projectsResult.data || []);
        }

        const content = contentResult.data && contentResult.data.content;
        if (content) {
            Object.entries(content).forEach(([key, value]) => setText(key, value));
            const metaDescription = document.querySelector('meta[name="description"]');
            if (typeof content.meta_description === "string") metaDescription.content = content.meta_description;
            setWhatsAppLinks(content.whatsapp_number, content.whatsapp_message || "Hola, quiero hablar sobre un proyecto.");
            if (content.profile_image) {
                const portrait = document.querySelector(".portrait-frame");
                setImage(portrait, content.profile_image, "Foto de perfil");
                portrait.classList.add("portrait-has-image");
            }
            if (content.hero_image) {
                const heroVisual = document.querySelector(".hero-visual");
                setImage(heroVisual, content.hero_image, "Imagen de portada");
                heroVisual.classList.add("hero-visual-has-image");
            }
            document.title = content.page_title || `${content.brand_name || "BrielCode"} | Desarrollo digital`;
        }
        if (!servicesResult.error) renderServices(servicesResult.data || []);
    }

    loadContent().catch((error) => {
        console.error("No se pudo cargar el contenido publicado desde Supabase:", error);
        showProjectsError("No se pudieron cargar los proyectos publicados. Inténtalo de nuevo más tarde.");
    });
})();
