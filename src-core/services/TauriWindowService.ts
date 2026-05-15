import { LogicalSize } from '@tauri-apps/api/dpi'
import { getCurrentWindow } from '@tauri-apps/api/window'
import type { Window as TauriWindow } from '@tauri-apps/api/window'

/**
 * Configuration de comportement d'une fenetre Tauri.
 */
export type TauriWindowConfiguration = {
  minWidth?: number
  minHeight?: number
  width?: number
  height?: number
  resizable: boolean
  decorations: boolean
  maximized: boolean
}

/**
 * Service dedie aux transitions et dimensions de la fenetre Tauri.
 */
export class TauriWindowService {
  /**
   * Configure la fenetre principale de l'application.
   * @param {TauriWindowConfiguration} configuration - Configuration cible de la fenetre.
   * @returns {Promise<void>}
   */
  public static async configureCurrentWindow(configuration: TauriWindowConfiguration): Promise<void> {
    const appWindow: TauriWindow = getCurrentWindow()

    await appWindow.setDecorations(configuration.decorations)
    await appWindow.setResizable(configuration.resizable)

    if (configuration.minWidth && configuration.minHeight) {
      await appWindow.setMinSize(new LogicalSize(configuration.minWidth, configuration.minHeight))
    }

    if (configuration.width && configuration.height) {
      await appWindow.setSize(new LogicalSize(configuration.width, configuration.height))
      await appWindow.center()
    }

    if (configuration.maximized) {
      await appWindow.maximize()
    }
  }

  /**
   * Configure la fenetre principale apres l'ecran d'auto-update.
   * @returns {Promise<void>}
   */
  public static async configureMainWindow(): Promise<void> {
    await this.configureCurrentWindow({
      minWidth: 1280,
      minHeight: 720,
      width: 1280,
      height: 720,
      resizable: true,
      decorations: true,
      maximized: true,
    })
  }
}
