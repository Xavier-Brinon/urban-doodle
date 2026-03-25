# Ubiquitous Language

## Content model

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Post** | The primary content type — a living, date-stamped blog entry spanning any hobby topic, identified by carrying the `post` tag in frontmatter. Posts can be revised after publication. | Blog post, article, entry |
| **Profile Page** | A static personal page (resume, about, book list) that appears in the header navigation via Custom Links, not in the Sidebar hierarchy | About page, static page |
| **Page** | A navigable content entry placed in the Sidebar hierarchy via `eleventyNavigation`, reserved for future structured content (docs, guides, digital garden) | Doc, article, section |
| **System Page** | A generated page (search, tag list, blog index, home page) excluded from collections and not authored as Markdown | Template page, auto page |
| **Sandbox** | An embedded interactive code playground that renders HTML in a split-pane (code + result) | Demo, snippet, embed, playground |
| **Inline Sandbox** | A Sandbox whose HTML is written directly in the Markdown source via the `sandbox` shortcode | — |
| **File Sandbox** | A Sandbox that references an external HTML file in `/sandboxes/` via the `sandboxFile` shortcode | — |

## Content lifecycle

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Publication Date** | The date a Post was first published, set via the `date` frontmatter field. Required for all Posts. | Created date, post date |
| **Revision Log** | An optional author-curated list of significant changes to a Post, displayed in the footer. Minor fixes (typos, formatting) are not logged. | Changelog, edit history, version history |

## Tagging and discovery

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Tag** | A freeform label assigned to content via frontmatter `tags`. Tags are the reader's primary mechanism for filtering Posts across hobby topics. | Category, label, topic |
| **Collection** | An Eleventy-managed group of content items, either built-in (e.g. `post`) or derived (e.g. `myTags`, `postsByDateDescending`) | List, index, feed |
| **Tag Page** | A System Page listing all content items that share a given Tag | Tag index, tag archive |

## Navigation

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Navigation Key** | The `eleventyNavigation.key` value that uniquely identifies a Page in the Sidebar tree | Nav label, menu item |
| **Parent** | The Navigation Key of the Page one level up in the hierarchy, set via `eleventyNavigation.parent` | Container, section |
| **Breadcrumb** | The ordered path from the home page to the current Page, derived from the navigation tree | Trail, path |
| **Sidebar** | The persistent left-hand navigation menu showing the full Page hierarchy. Not used for Posts or Profile Pages. | Menu, nav, drawer |
| **Custom Link** | An external navigation entry in the header, defined in Settings, pointing outside the site (GitHub, Radicle, etc.) | External link |

## Theme and template layers

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **LibDoc** | The documentation theme layer that provides layouts, shortcodes, filters, assets, and configuration on top of Eleventy | Template, theme, framework |
| **Core** | The `/core/` directory containing LibDoc's own templates, CSS, JavaScript, fonts, and icons — not intended for user modification | System, lib, base |
| **Layout** | A Liquid template in `_includes/` that wraps content into a full HTML page (always `libdoc_page.liquid` for authored content) | Template, wrapper |
| **Shortcode** | A reusable template macro invoked in Markdown (e.g. `{% alert %}`, `{% icon %}`, `{% sandbox %}`) | Widget, component, macro |
| **Filter** | A Liquid transformation applied to content during rendering (e.g. `autoids`, `toc`, `cleanup`) | Transform, pipe, processor |

## Configuration

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Settings** | The user-facing `settings.json` file that controls site metadata, features, and display options | Config, options, prefs |
| **LibDoc Config** | The merged configuration object (`_data/libdocConfig.js`) combining user Settings with LibDoc defaults | — |
| **LibDoc System** | The `_data/libdocSystem.json` file containing internal constants (sidebar width, icon library, navigation markup options) | System config, internals |
| **Blog Slug** | The URL segment for the blog section, configurable in Settings (default: `posts`) | Blog path, blog prefix |

## Media and assets

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Image Transform** | Eleventy Image's automatic transcoding and resizing of images into multiple formats (SVG, AVIF, WebP) and widths | Image processing, optimisation |
| **Icon** | A named symbol from LibDoc's built-in icon library, rendered via the `icon` shortcode | Glyph, symbol |
| **Open Graph Image** | The social-media preview image for a Post, Profile Page, or Page, set via `ogImageUrl` in frontmatter or per-Tag in Settings | OG image, social image, preview |

## Search

| Term | Definition | Aliases to avoid |
|------|-----------|-----------------|
| **Search Index** | A JSON file generated at build time containing titles, descriptions, tags, and body text for client-side search | Index, catalogue |
| **Fuzzy Search** | Approximate matching mode that tolerates typos, using the lightweight fuzzy index (titles, descriptions, tags only) | Approximate search |
| **Standard Search** | Exact string matching mode using the full Search Index | Normal search, exact search |

## Relationships

- A **Post** is the primary content type. It is discoverable via **Tags** and the blog index (home page).
- A **Post** has exactly one **Publication Date** and an optional **Revision Log**.
- A **Profile Page** appears in the header navigation and does not participate in the **Sidebar** hierarchy or the blog feed.
- A **Page** belongs to zero or one **Parent** Pages in the **Sidebar**, forming an arbitrarily deep tree. Reserved for future use.
- A **Tag** can be applied to any number of Posts and Pages; each Tag produces one **Tag Page**.
- A **Collection** is computed from Tags or custom logic; the special `post` Tag defines the Post Collection.
- **Settings** are merged into **LibDoc Config** at build time, with LibDoc defaults as fallback.
- **Core** assets and templates are consumed by **Layouts**, which render all content types.
- A **Sandbox** (Inline or File) is embedded within a Post or Page via a **Shortcode**.
- The **Search Index** is generated from all Posts, Profile Pages, and Pages (excluding System Pages).
- An **Open Graph Image** can be set per-Post, per-Profile Page, per-Page, or per-Tag (Tag-level overrides content-level).
- **Custom Links** point exclusively to external resources.

## Example dialogue

> **Dev:** "I want to write about my weekend woodworking project. Post or Profile Page?"
> **Domain expert:** "A **Post** — it's dated content about a hobby. Tag it with something like `woodworking` so readers interested in that topic can find all your woodworking **Posts** via the **Tag Page**."
>
> **Dev:** "I also want to add my resume to the site."
> **Domain expert:** "That's a **Profile Page**. It goes in the header navigation, not the blog feed. Add it as a Markdown file and link it via `customLinks` in **Settings**."
>
> **Dev:** "I updated an old post with new techniques I learned. How do I show that?"
> **Domain expert:** "The **Publication Date** stays the same — that's when it was first published. Add a **Revision Log** entry in the frontmatter describing what changed. The `gitLastModifiedDate` **Filter** will automatically show the last-modified date."
>
> **Dev:** "The post has a live HTML demo. **Inline Sandbox** or **File Sandbox**?"
> **Domain expert:** "If the HTML is short, **Inline Sandbox**. If it's complex, put it in `/sandboxes/` and use a **File Sandbox**."
>
> **Dev:** "Should I add a GitHub link to the header?"
> **Domain expert:** "Yes — that's a **Custom Link**. It points to an external resource, so it goes in the `customLinks` array in **Settings**."

## Flagged ambiguities

- **"page"** is overloaded three ways: **Page** (sidebar-navigated content), **Profile Page** (header-navigated static content), and generic HTML output. In this glossary, capitalised **Page** always means sidebar content. Use "output file" or "rendered page" (lowercase) for generic HTML output.
- **"template"** can mean a Liquid **Layout**, a **Shortcode**, or the LibDoc theme itself. Prefer the specific term.
- **"config" / "configuration"** can refer to **Settings** (user-facing), **LibDoc Config** (merged runtime object), or **LibDoc System** (internal constants). Use the specific term.
- **"collection"** in Eleventy is both an automatic per-tag grouping and a custom-defined grouping. The `post` tag creates a built-in collection, while `myTags` and `postsByDateDescending` are custom **Collections** defined in `libdocFunctions.js`.

## Out of scope

The following concepts belong to separate bounded contexts and are not modelled here:

- **Private content** — French-language personal posts, served from a separate auth-gated deploy
- **Code hosting** — self-hosted repository viewer (e.g. Fossil SCM), separate service
- **Internationalisation** — LibDoc supports en/fr/it but this public site is English-only
