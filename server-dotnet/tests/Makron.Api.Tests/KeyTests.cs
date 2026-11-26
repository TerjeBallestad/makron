using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Makron.Api.Data;

namespace Makron.Api.Tests;

public class KeyTests(MakronFactory factory) : IClassFixture<MakronFactory>
{
    [Fact]
    public async Task Key_in_db_after_login()
    {
        await factory.LoginAs("ada@turtle.test");
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MakronDb>();
        bool anyKeys = await db.DataProtectionKeys.AnyAsync();
        Assert.True(anyKeys);
    }

    [Fact]
    public async Task All_keys_encrypted()
    {
        await factory.LoginAs("ada@turtle.test");
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MakronDb>();
        var keys = await db.DataProtectionKeys.Select(k => k.Xml).ToListAsync();
        Assert.NotEmpty(keys);
        Assert.All(keys, key => Assert.DoesNotContain("<masterKey", key));
        Assert.All(keys, key => Assert.Contains("<encryptedSecret", key));
    }

    [Fact]
    public async Task Wrong_certificate_stops_the_start()
    {
        await factory.LoginAs("ada@turtle.test");
        var otherPath = MakronFactory.WritePfx("CN=wrong-keys");
        try
        {
            using var other = factory.WithWebHostBuilder(b =>
                b.UseSetting("KeyCertificate:Path", otherPath)
            );
            Assert.ThrowsAny<Exception>(other.CreateClient);
        }
        finally
        {
            File.Delete(otherPath);
        }
    }
}
