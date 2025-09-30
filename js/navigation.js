// 导航功能
class NavigationManager {
    constructor() {
        this.mobileMenuButton = document.getElementById('mobile-menu-button');
        this.mobileMenu = document.getElementById('mobile-menu');
        this.init();
    }

    init() {
        // 移动端菜单切换
        this.mobileMenuButton.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // 点击菜单项关闭移动端菜单
        this.mobileMenu.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                this.closeMobileMenu();
            }
        });

        // 平滑滚动
        this.initSmoothScroll();
    }

    toggleMobileMenu() {
        const isHidden = this.mobileMenu.classList.contains('hidden');
        if (isHidden) {
            this.openMobileMenu();
        } else {
            this.closeMobileMenu();
        }
    }

    openMobileMenu() {
        this.mobileMenu.classList.remove('hidden');
        this.mobileMenu.classList.add('animate-fade-in');
    }

    closeMobileMenu() {
        this.mobileMenu.classList.add('hidden');
        this.mobileMenu.classList.remove('animate-fade-in');
    }

    initSmoothScroll() {
        // 为所有内部链接添加平滑滚动
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// 初始化导航管理器
document.addEventListener('DOMContentLoaded', () => {
    new NavigationManager();
});