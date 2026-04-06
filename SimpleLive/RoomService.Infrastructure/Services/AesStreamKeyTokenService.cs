using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using RoomService.Domain.Services;
using RoomService.Infrastructure.Options;

namespace RoomService.Infrastructure.Services;

public sealed class AesStreamKeyTokenService : IStreamKeyTokenService
{
    private const int AesBlockSize = 16;
    private readonly byte[] _key;

    public AesStreamKeyTokenService(IOptions<LiveRoomOptions> options)
    {
        var secret = options.Value.StreamKeyAesSecret;
        if (string.IsNullOrWhiteSpace(secret))
        {
            throw new InvalidOperationException("LiveRoom:StreamKeyAesSecret is not configured.");
        }

        _key = SHA256.HashData(Encoding.UTF8.GetBytes(secret.Trim()));
    }

    public string Encrypt(StreamKeyPayload payload)
    {
        ArgumentNullException.ThrowIfNull(payload);

        var jsonBytes = JsonSerializer.SerializeToUtf8Bytes(payload);

        using var aes = Aes.Create();
        aes.Key = _key;
        aes.Mode = CipherMode.CBC;
        aes.Padding = PaddingMode.PKCS7;
        aes.GenerateIV();

        using var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
        var cipherBytes = encryptor.TransformFinalBlock(jsonBytes, 0, jsonBytes.Length);

        var tokenBytes = new byte[aes.IV.Length + cipherBytes.Length];
        Buffer.BlockCopy(aes.IV, 0, tokenBytes, 0, aes.IV.Length);
        Buffer.BlockCopy(cipherBytes, 0, tokenBytes, aes.IV.Length, cipherBytes.Length);

        return ToBase64Url(tokenBytes);
    }

    public bool TryDecrypt(string token, out StreamKeyPayload? payload, out string? errorMessage)
    {
        payload = null;
        errorMessage = null;

        if (string.IsNullOrWhiteSpace(token))
        {
            errorMessage = "推流密钥不能为空";
            return false;
        }

        try
        {
            var allBytes = FromBase64Url(token.Trim());
            if (allBytes.Length <= AesBlockSize)
            {
                errorMessage = "推流密钥格式错误";
                return false;
            }

            var iv = allBytes[..AesBlockSize];
            var cipherBytes = allBytes[AesBlockSize..];

            using var aes = Aes.Create();
            aes.Key = _key;
            aes.IV = iv;
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;

            using var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
            var jsonBytes = decryptor.TransformFinalBlock(cipherBytes, 0, cipherBytes.Length);
            var parsed = JsonSerializer.Deserialize<StreamKeyPayload>(jsonBytes);

            if (parsed is null || string.IsNullOrWhiteSpace(parsed.RoomNumber) || parsed.HostId == Guid.Empty)
            {
                errorMessage = "推流密钥内容无效";
                return false;
            }

            payload = parsed;
            return true;
        }
        catch (Exception ex)
        {
            errorMessage = $"推流密钥解密失败: {ex.Message}";
            return false;
        }
    }

    private static string ToBase64Url(byte[] bytes)
    {
        return Convert.ToBase64String(bytes).Replace('+', '-').Replace('/', '_').TrimEnd('=');
    }

    private static byte[] FromBase64Url(string encoded)
    {
        var base64 = encoded.Replace('-', '+').Replace('_', '/');
        switch (base64.Length % 4)
        {
            case 2:
                base64 += "==";
                break;
            case 3:
                base64 += "=";
                break;
        }

        return Convert.FromBase64String(base64);
    }
}
