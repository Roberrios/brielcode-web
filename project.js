(() => {
    const config = window.BRIELCODE_SUPABASE_CONFIG;
    const state = document.getElementById("project-state");
    const content = document.getElementById("project-content");
    const year = document.getElementById("current-year");
    year.textContent = new Date().getFullYear();

    function addMeta(label, value) {
        if (!value) return;
        const item = document.createElement("span");
        item.textContent = `${label}: ${value}`;
        document.getElementById("project-meta").append(item);
    }

    function addProjectSection(sectionId, textId, value) {
        if (!value || !value.trim()) return;
        document.getElementById(textId).textContent = value;
        document.getElementById(sectionId).hidden = false;
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

    function setUnavailable(message) {
        state.replaceChildren();
        const title = document.createElement("h1");
        title.textContent = "No encontramos este proyecto.";
        const description = document.createElement("p");
        description.textContent = message;
        const back = document.createElement("a");
        back.className = "button button-primary";
        back.href = "/#proyectos";
        back.textContent = "Volver a proyectos";
        state.append(title, description, back);
        state.hidden = false;
        content.hidden = true;
    }

    function renderTags(tags) {
        const list = document.getElementById("project-tags");
        list.replaceChildren(...(tags || []).map((tag) => {
            const item = document.createElement("span");
            item.textContent = tag;
            return item;
        }));
        if (!tags || !tags.length) list.hidden = true;
    }

    function renderGallery(project) {
        const urls = project.gallery_urls || [];
        const gallery = document.getElementById("project-gallery");
        if (!urls.length) return;
        let currentIndex = 0;
        const image = document.createElement("img");
        image.loading = "lazy";

        function showImage(index) {
            currentIndex = index;
            image.src = urls[currentIndex];
            image.alt = `${project.title} — imagen ${currentIndex + 1}`;
            document.getElementById("gallery-counter").textContent = `${currentIndex + 1} / ${urls.length}`;
            document.getElementById("gallery-previous").disabled = currentIndex === 0;
            document.getElementById("gallery-next").disabled = currentIndex === urls.length - 1;
        }

        gallery.replaceChildren(image);
        showImage(currentIndex);
        if (urls.length === 1) {
            document.getElementById("gallery-previous").hidden = true;
            document.getElementById("gallery-next").hidden = true;
        } else {
            document.getElementById("gallery-previous").addEventListener("click", () => showImage(currentIndex - 1));
            document.getElementById("gallery-next").addEventListener("click", () => showImage(currentIndex + 1));
        }
        document.getElementById("gallery-section").hidden = false;
    }

    async function loadProject() {
        if (!config || !config.url || !config.anonKey || !window.supabase) {
            setUnavailable("Los proyectos estarán disponibles cuando se configure la conexión del sitio.");
            return;
        }
        const id = new URLSearchParams(window.location.search).get("id");
        if (!id) {
            setUnavailable("El enlace no incluye un proyecto válido.");
            return;
        }

        const client = window.supabase.createClient(config.url, config.anonKey);
        const [projectResult, contentResult] = await Promise.all([
            client.from("projects").select("*").eq("id", id).eq("published", true).maybeSingle(),
            client.from("site_content").select("content").eq("id", "main").maybeSingle()
        ]);
        if (projectResult.error) throw projectResult.error;
        if (contentResult.error) throw contentResult.error;
        if (!projectResult.data) {
            setUnavailable("Puede que se haya eliminado o que ya no esté publicado.");
            return;
        }

        const project = projectResult.data;
        const siteContent = contentResult.data && contentResult.data.content;
        if (siteContent && siteContent.brand_name) {
            document.getElementById("detail-brand-name").textContent = siteContent.brand_name;
            document.getElementById("detail-footer-brand").textContent = siteContent.brand_name;
        }
        if (siteContent && siteContent.brand_initial) {
            document.getElementById("detail-brand-initial").textContent = siteContent.brand_initial;
        }
        if (siteContent && siteContent.nav_cta) {
            document.getElementById("detail-nav-cta").textContent = siteContent.nav_cta;
        }
        document.getElementById("project-category").textContent = project.category || "PROYECTO";
        document.getElementById("project-title").textContent = project.title;
        document.getElementById("project-description").textContent = project.description || "";
        addMeta("Cliente", project.client_name);
        addMeta("Año", project.project_year);
        addMeta("Rol", project.project_role);
        renderTags(project.tags);
        addProjectSection("challenge-section", "project-challenge", project.challenge);
        addProjectSection("solution-section", "project-solution", project.solution);
        addProjectSection("results-section", "project-results", project.results);

        const cover = document.getElementById("project-cover");
        if (project.image_url) {
            const image = document.createElement("img");
            image.src = project.image_url;
            image.alt = project.title;
            image.fetchPriority = "high";
            cover.append(image);
        } else {
            const placeholder = document.createElement("div");
            placeholder.className = "detail-cover-placeholder";
            placeholder.textContent = (project.title || "B").charAt(0).toUpperCase();
            cover.append(placeholder);
        }
        if (project.project_url) {
            const externalLink = document.getElementById("live-project-link");
            externalLink.href = project.project_url;
            externalLink.hidden = false;
        }
        renderGallery(project);
        const contactMessage = siteContent && siteContent.whatsapp_message
            ? `${siteContent.whatsapp_message} Me interesa conversar sobre el proyecto ${project.title}.`
            : `Hola, me interesa conversar sobre el proyecto ${project.title}.`;
        setWhatsAppLinks(siteContent && siteContent.whatsapp_number, contactMessage);

        const brand = siteContent && siteContent.brand_name || "BrielCode";
        document.title = `${project.title} | ${brand}`;
        document.querySelector('meta[name="description"]').content = project.description || `Conoce el proyecto ${project.title} desarrollado por ${brand}.`;
        state.hidden = true;
        content.hidden = false;
    }

    loadProject().catch((error) => {
        console.error("No se pudo cargar el detalle del proyecto:", error);
        setUnavailable("Ocurrió un error al cargar el proyecto. Inténtalo de nuevo más tarde.");
    });
})();
