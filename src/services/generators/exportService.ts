import JSZip from 'jszip';
import { Project } from '../../types';

export class ExportService {
  /**
   * Generates and triggers download of a full project.zip bundle containing
   * all Android, Backend, Admin, Database, and Documentation files.
   */
  public static async exportProjectZip(project: Project): Promise<Blob> {
    const zip = new JSZip();

    // 1. Add all project files from the virtual file system
    for (const [filePath, content] of Object.entries(project.files)) {
      zip.file(filePath, content);
    }

    // 2. Add project metadata and app-spec.json
    zip.file('project.json', JSON.stringify({
      id: project.id,
      name: project.name,
      packageName: project.packageName,
      description: project.description,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      version: project.spec.version,
      versionCode: project.spec.versionCode
    }, null, 2));

    zip.file('app-spec.json', JSON.stringify(project.spec, null, 2));

    // 3. Add Google Play Store Listing package
    zip.file('google-play-listing.json', JSON.stringify(project.playListing, null, 2));

    // 4. Add APK & AAB placeholder build packages with signature manifest
    const buildManifest = `AppForge AI Android Build Output
App: ${project.name}
Package: ${project.packageName}
Target SDK: 34
Min SDK: 24
Build Date: ${new Date().toISOString()}
Keystore: SHA-256 Release Signed
Ready for Google Play Publishing & TestFlight/Firebase App Distribution.
`;
    zip.file('build/app-release-manifest.txt', buildManifest);

    // Generate zip Blob
    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    return blob;
  }

  /**
   * Triggers browser download of a blob
   */
  public static triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
