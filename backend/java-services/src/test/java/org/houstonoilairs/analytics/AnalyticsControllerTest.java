package org.houstonoilairs.analytics;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testResearchTrendsEndpoint() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/analytics/research-trends")
                .param("category", "alignment")
                .param("timeframe", "24")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    public void testNetworkAnalysisEndpoint() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.post("/api/analytics/network-analysis")
                .contentType(MediaType.APPLICATION_JSON)
                .content("[\"alignment\", \"fairness\"]"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    public void testNetworkAnalysisEndpointNoContent() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.post("/api/analytics/network-analysis")
                .contentType(MediaType.APPLICATION_JSON)
                .content("[]"))
                .andExpect(status().isNoContent());
    }

    @Test
    public void testHealthEndpoint() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/analytics/health")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value("healthy"));
    }

    @Test
    public void testResearchTrendsEndpointNoContent() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/analytics/research-trends")
                .param("category", "alignment")
                .param("timeframe", "0")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());
    }
}
