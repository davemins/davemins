namespace davemins.Utils;

public static class FrontmatterParser
{
    public static (Dictionary<string, string> Meta, string Body) Parse(string content)
    {
        var meta = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        if (!content.TrimStart().StartsWith("---"))
            return (meta, content);

        var start = content.IndexOf("---") + 3;
        var end = content.IndexOf("---", start);
        if (end < 0) return (meta, content);

        var frontmatter = content[start..end].Trim();
        var body = content[(end + 3)..].Trim();

        foreach (var line in frontmatter.Split('\n'))
        {
            var colon = line.IndexOf(':');
            if (colon <= 0) continue;
            var key = line[..colon].Trim();
            var value = line[(colon + 1)..].Trim();
            if (!string.IsNullOrEmpty(key))
                meta[key] = value;
        }

        return (meta, body);
    }
}
