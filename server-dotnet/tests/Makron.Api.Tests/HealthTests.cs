using System.Net;
using System.Net.Http.Json;

namespace Makron.Api.Tests;

public class HealthTests(MakronFactory factory) : IClassFixture<MakronFactory>
{
    [Fact]
    public async Task Health_answers_ok_when_postgres_answers()
    {
        var client = factory.CreateClient();
        var res = await client.GetAsync("/api/health");
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        var body = await res.Content.ReadFromJsonAsync<HealthBody>();
        Assert.True(body!.Ok);
    }

    private record HealthBody(bool Ok);
}
