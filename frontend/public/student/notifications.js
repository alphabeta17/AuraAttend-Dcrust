/**
 * Notifications Module (notifications.js)
 * Handles Notification state, API integration, rendering, badge updates, and user interactions.
 */

class NotificationManager {
  constructor(options = {}) {
    // Configurable DOM element IDs (Aapke project ke HTML IDs ke sath matched)
    this.btnId = options.btnId || "bellIcon";
    this.drawerId = options.drawerId || "notifDropdown";
    this.listId = options.listId || "notifBody";
    this.badgeId = options.badgeId || "notifBadge";
    this.markReadBtnId = options.markReadBtnId || "markReadBtn";

    this.notifications = [];
    this.init();
  }

  /**
   * Fetch initial notifications from server or local API mock
   */
  async fetchNotificationsFromApi() {
    // Future mein aap yahan apna actual backend API endpoint de sakte hain e.g., fetch('/api/notifications')
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            title: "Lab Attendance Marked",
            desc: "Present for OOPs Java Lab #18 (Interfaces)",
            time: "2 hours ago",
            unread: true,
            type: "attendance"
          },
          {
            id: 2,
            title: "Streak Milestones!",
            desc: "You hit a 12-day consecutive attendance streak!",
            time: "1 day ago",
            unread: true,
            type: "achievement"
          },
          {
            id: 3,
            title: "Class Rescheduled",
            desc: "Java Theory lecture shifted to 3:00 PM tomorrow.",
            time: "3 days ago",
            unread: false,
            type: "alert"
          }
        ]);
      }, 300);
    });
  }

  /**
   * Initialize DOM bindings & event listeners
   */
  async init() {
    this.btn = document.getElementById(this.btnId);
    this.drawer = document.getElementById(this.drawerId);
    this.badge = document.getElementById(this.badgeId);
    this.markReadBtn = document.getElementById(this.markReadBtnId);

    // Dynamic list container target karne ke liye
    this.list = document.getElementById(this.listId);

    if (!this.btn || !this.drawer) {
      console.warn("Notification elements missing from DOM.");
      return;
    }

    // Load initial data
    this.notifications = await this.fetchNotificationsFromApi();
    this.render();

    // Attach event handlers
    this.attachEvents();
  }

  /**
   * Attach drawer toggle and outside click listeners
   */
  attachEvents() {
    // Toggle notification panel drawer on bell click
    this.btn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleDrawer();
    });

    // Close when clicking anywhere outside
    document.addEventListener("click", (e) => {
      if (this.drawer && this.btn) {
        if (!this.drawer.contains(e.target) && !this.btn.contains(e.target)) {
          this.closeDrawer();
        }
      }
    });

    // Mark all as read button (agar ho)
    if (this.markReadBtn) {
      this.markReadBtn.addEventListener("click", () => {
        this.markAllAsRead();
      });
    }
  }

  /**
   * Toggle Drawer Visibility (Using display block/flex or custom classes)
   */
  toggleDrawer() {
    // Agar Tailwind ki 'hidden' class use ho rahi hai ya display toggle karna ho
    if (this.drawer.classList.contains("hidden")) {
      this.drawer.classList.remove("hidden");
      this.drawer.style.display = "flex";
    } else {
      this.drawer.classList.add("hidden");
      this.drawer.style.display = "none";
    }
  }

  /**
   * Close Drawer
   */
  closeDrawer() {
    if (this.drawer) {
      this.drawer.classList.add("hidden");
      this.drawer.style.display = "none";
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, unread: false }));
    this.render();
  }

  /**
   * Add a new notification dynamically (Useful for API WebSocket/Push updates)
   */
  addNotification(notification) {
    this.notifications.unshift({
      id: Date.now(),
      unread: true,
      time: "Just now",
      ...notification
    });
    this.render();
  }

  /**
   * Render notifications list & badge count
   */
  render() {
    const unreadCount = this.notifications.filter((n) => n.unread).length;

    // Update unread badge count
    if (this.badge) {
      if (unreadCount > 0) {
        this.badge.textContent = unreadCount;
        this.badge.classList.remove("hidden");
        this.badge.style.display = "grid";
      } else {
        this.badge.classList.add("hidden");
        this.badge.style.display = "none";
      }
    }

    if (!this.list) return;

    // Empty state
    if (this.notifications.length === 0) {
      this.list.innerHTML = `
        <div class="text-center py-6 text-purple-400/60 text-xs">
          No new notifications
        </div>
      `;
      return;
    }

    // Render list items using your exact requested styling
    this.list.innerHTML = this.notifications
      .map(
        (item) => `
      <div class="p-3 rounded-2xl transition-all mb-2 ${
        item.unread
          ? "bg-purple-900/30 border border-purple-500/30"
          : "bg-purple-950/20 border border-purple-900/20 opacity-70"
      }">
        <div class="flex items-start justify-between">
          <h4 class="text-xs font-semibold text-purple-100">${item.title}</h4>
          <span class="text-[10px] text-purple-400">${item.time}</span>
        </div>
        <p class="text-[11px] text-purple-300/80 mt-1">${item.desc}</p>
      </div>
    `
      )
      .join("");
  }
}

// Initialize on page load automatically across all pages
document.addEventListener("DOMContentLoaded", () => {
  window.notificationSystem = new NotificationManager();
});