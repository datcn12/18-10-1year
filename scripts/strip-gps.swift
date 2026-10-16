// Removes GPS tags from images in place, without re-encoding the pixels.
// All other metadata, orientation included, is kept. Run by prep-photos.sh: swift scripts/strip-gps.swift a.jpg ...
import Foundation
import ImageIO

var failed = false

func warn(_ message: String) {
    FileHandle.standardError.write(Data("\(message)\n".utf8))
    failed = true
}

for path in CommandLine.arguments.dropFirst() {
    let url = URL(fileURLWithPath: path)
    guard let source = CGImageSourceCreateWithURL(url as CFURL, nil), let type = CGImageSourceGetType(source) else {
        warn("could not read \(path)")
        continue
    }
    guard let metadata = CGImageSourceCopyMetadataAtIndex(source, 0, nil) else { continue }

    // ImageIO's own "exclude GPS" option also drops the orientation tag, so the GPS tags are removed by hand.
    var gpsTags: [CFString] = []
    CGImageMetadataEnumerateTagsUsingBlock(metadata, nil, nil) { tagPath, tag in
        let prefix = CGImageMetadataTagCopyPrefix(tag) as String?
        let name = CGImageMetadataTagCopyName(tag) as String?
        if prefix == "exif", name?.hasPrefix("GPS") == true { gpsTags.append(tagPath) }
        return true
    }
    if gpsTags.isEmpty { continue }

    guard let cleaned = CGImageMetadataCreateMutableCopy(metadata) else {
        warn("could not copy metadata of \(path)")
        continue
    }
    for tagPath in gpsTags { CGImageMetadataRemoveTagWithPath(cleaned, nil, tagPath) }

    let temp = url.deletingLastPathComponent().appendingPathComponent(".gps-\(url.lastPathComponent)")
    let options = [kCGImageDestinationMetadata: cleaned, kCGImageDestinationMergeMetadata: false] as CFDictionary
    guard
        let destination = CGImageDestinationCreateWithURL(temp as CFURL, type, 1, nil),
        CGImageDestinationCopyImageSource(destination, source, options, nil)
    else {
        warn("could not strip GPS from \(path)")
        continue
    }
    do {
        _ = try FileManager.default.replaceItemAt(url, withItemAt: temp)
    } catch {
        warn("could not replace \(path): \(error)")
    }
}
exit(failed ? 1 : 0)
